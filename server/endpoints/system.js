process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();
const {
  normalizePath,
  isWithin,
  listFolders,
  getDocumentsByFolder,
  searchDocuments,
  getDocumentsByDocPaths,
} = require("../utils/files");
const { purgeDocument, purgeFolder } = require("../utils/files/purgeDocument");
const { getVectorDbClass } = require("../utils/helpers");
const { updateENV, dumpENV } = require("../utils/helpers/updateENV");
const {
  reqBody,
  makeJWT,
  userFromSession,
  multiUserMode,
  queryParams,
} = require("../utils/http");
const {
  handleAssetUpload,
  handlePfpUpload,
  handleAudioUpload,
} = require("../utils/files/multer");
const { v4 } = require("uuid");
const { SystemSettings } = require("../models/systemSettings");
const { User } = require("../models/user");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const prisma = require("../utils/prisma");
const failedPinAttempts = new Map();
const fs = require("fs");
const path = require("path");
const {
  getDefaultFilename,
  determineLogoFilepath,
  fetchLogo,
  validFilename,
  renameLogoFile,
  removeCustomLogo,
  LOGO_FILENAME,
  isDefaultFilename,
} = require("../utils/files/logo");
const { Telemetry } = require("../models/telemetry");
const { ApiKey } = require("../models/apiKeys");
const { getCustomModels } = require("../utils/helpers/customModels");
const { WorkspaceChats } = require("../models/workspaceChats");
const {
  flexUserRoleValid,
  ROLES,
  isMultiUserSetup,
} = require("../utils/middleware/multiUserProtected");
const { fetchPfp, determinePfpFilepath } = require("../utils/files/pfp");
const { exportChatsAsType } = require("../utils/helpers/chat/convertTo");
const { EventLogs } = require("../models/eventLogs");
const { CollectorApi } = require("../utils/collectorApi");
const {
  recoverAccount,
  resetPassword,
  generateRecoveryCodes,
} = require("../utils/PasswordRecovery");
const { SlashCommandPresets } = require("../models/slashCommandsPresets");
const { EncryptionManager } = require("../utils/EncryptionManager");
const { BrowserExtensionApiKey } = require("../models/browserExtensionApiKey");
const { MobileDevice } = require("../models/mobileDevice");
const {
  chatHistoryViewable,
} = require("../utils/middleware/chatHistoryViewable");
const {
  simpleSSOEnabled,
  simpleSSOLoginDisabled,
} = require("../utils/middleware/simpleSSOEnabled");
const { TemporaryAuthToken } = require("../models/temporaryAuthToken");
const { SystemPromptVariables } = require("../models/systemPromptVariables");
const { VALID_COMMANDS } = require("../utils/chats");
const { AgentSkillWhitelist } = require("../models/agentSkillWhitelist");
const { Memory } = require("../models/memory");

function systemEndpoints(app) {
  if (!app) return;

  app.get("/ping", (_, response) => {
    response.status(200).json({ online: true });
  });

  app.get("/migrate", async (_, response) => {
    response.sendStatus(200);
  });

  app.get("/env-dump", async (_, response) => {
    if (process.env.NODE_ENV !== "production")
      return response.sendStatus(200).end();
    dumpENV();
    response.sendStatus(200).end();
  });

  app.get("/onboarding", async (_, response) => {
    try {
      const results = await SystemSettings.isOnboardingComplete();
      response.status(200).json({ onboardingComplete: results });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post("/onboarding", [validatedRequest], async (_, response) => {
    try {
      await SystemSettings.markOnboardingComplete();
      response.sendStatus(200).end();
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/setup-complete", async (_, response) => {
    try {
      const results = await SystemSettings.currentSettings();
      response.status(200).json({ results });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get(
    "/system/check-token",
    [validatedRequest],
    async (request, response) => {
      try {
        if (multiUserMode(response)) {
          const user = await userFromSession(request, response);
          if (!user || user.suspended) {
            response.sendStatus(403).end();
            return;
          }

          response.sendStatus(200).end();
          return;
        }

        response.sendStatus(200).end();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  /**
   * Refreshes the user object from the session from a provided token.
   * This does not refresh the token itself - if that is expired or invalid, the user will be logged out.
   * This simply keeps the user object in sync with the database over the course of the session.
   * @returns {Promise<{success: boolean, user: Object | null, message: string | null}>}
   */
  app.get(
    "/system/refresh-user",
    [validatedRequest],
    async (request, response) => {
      try {
        if (!multiUserMode(response))
          return response
            .status(200)
            .json({ success: true, user: null, message: null });

        const user = await userFromSession(request, response);
        if (!user)
          return response.status(200).json({
            success: false,
            user: null,
            message: "Session expired or invalid.",
          });

        if (user.suspended)
          return response.status(200).json({
            success: false,
            user: null,
            message: "User is suspended.",
          });

        return response.status(200).json({
          success: true,
          user: User.filterFields(user),
          message: null,
        });
      } catch (e) {
        return response.status(500).json({
          success: false,
          user: null,
          message: e.message,
        });
      }
    }
  );

  app.post("/request-token/register", async (request, response) => {
    try {
      const { name, email, password } = reqBody(request);

      if (!email || !password) {
        response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: "Email and password are required.",
        });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(cleanEmail)) {
        response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: "Please enter a valid email address.",
        });
        return;
      }

      // Format username to satisfy User model validation (must start with lowercase letter)
      let username = cleanEmail;
      if (!/^[a-z]/.test(username)) {
        username = "u_" + username;
      }

      const { user, error } = await User.create({
        username,
        password,
        role: "default",
        bio: name ? String(name).trim() : "",
      });

      if (error || !user) {
        response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: error || "Could not create account.",
        });
        return;
      }

      // Auto-issue session JWT token upon registration
      const sessionToken = makeJWT(
        { id: user.id, username: user.username },
        process.env.JWT_EXPIRY
      );

      const { EventLogs } = require("../models/eventLogs");
      await EventLogs.logEvent(
        "user_registered",
        {
          ip: request.ip || "Unknown IP",
          username: user.username,
        },
        user.id
      );

      response.status(200).json({
        success: true,
        user,
        token: sessionToken,
        message: null,
      });
    } catch (e) {
      console.error("Public registration failed:", e);
      response.status(500).json({
        success: false,
        user: null,
        token: null,
        message: e.message || "An unexpected error occurred.",
      });
    }
  });

  // GUEST MODE: Setup First-Time Guest & Private Workspace
  app.post("/request-token/guest/setup", async (request, response) => {
    try {
      const { name, pin, confirmPin } = reqBody(request);

      if (!pin || !confirmPin) {
        return response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: "4-digit PIN and PIN confirmation are required.",
        });
      }

      const cleanPin = String(pin).trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: "PIN must contain exactly 4 digits.",
        });
      }

      if (cleanPin !== String(confirmPin).trim()) {
        return response.status(400).json({
          success: false,
          user: null,
          token: null,
          message: "PINs do not match.",
        });
      }

      const bcrypt = require("bcryptjs");
      const { v4: uuidv4 } = require("uuid");
      const guestUsername = `guest_${uuidv4()}`;
      const hashedPassword = bcrypt.hashSync(cleanPin, 10);
      const displayName = name ? String(name).trim() : "Guest User";

      const user = await prisma.users.create({
        data: {
          username: guestUsername,
          password: hashedPassword,
          role: "guest",
          bio: displayName,
        },
      });

      // Automatically create a private workspace for the new guest with DEFAULT CHAT MODE = "chat"
      const { Workspace } = require("../models/workspace");
      const { WorkspaceUser } = require("../models/workspaceUsers");
      const workspaceName = `${displayName}'s Workspace`;
      const { workspace } = await Workspace.new(workspaceName, user.id, {
        chatMode: "chat",
      });
      if (workspace) {
        await WorkspaceUser.createMany(user.id, [workspace.id]);
      }

      const sessionToken = makeJWT(
        { id: user.id, username: user.username },
        process.env.JWT_EXPIRY
      );

      const { EventLogs } = require("../models/eventLogs");
      await EventLogs.logEvent(
        "guest_account_created",
        {
          ip: request.ip || "Unknown IP",
          username: user.username,
        },
        user.id
      );

      return response.status(200).json({
        success: true,
        user: User.filterFields(user),
        token: sessionToken,
        guestId: user.username,
        message: null,
      });
    } catch (e) {
      console.error("Guest setup error:", e);
      return response.status(500).json({
        success: false,
        user: null,
        token: null,
        message: e.message || "Failed to set up guest account.",
      });
    }
  });

  // GUEST MODE: Check if a 4-Digit PIN belongs to an existing guest account
  app.post("/request-token/guest/lookup", async (request, response) => {
    try {
      const { pin, guestId } = reqBody(request);
      const clientIp = request.ip || "unknown_ip";
      const lockKey = `${clientIp}_${guestId || "pin_lookup"}`;
      const now = Date.now();

      const record = failedPinAttempts.get(lockKey);
      if (record && record.lockUntil > now) {
        const remainingMinutes = Math.ceil(
          (record.lockUntil - now) / (60 * 1000)
        );
        return response.status(429).json({
          isExisting: false,
          user: null,
          token: null,
          message: `Too many failed PIN attempts. Locked out for ${remainingMinutes} minute(s).`,
        });
      }

      if (!pin) {
        return response.status(400).json({
          isExisting: false,
          user: null,
          token: null,
          message: "4-digit PIN is required.",
        });
      }

      const cleanPin = String(pin).trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return response.status(400).json({
          isExisting: false,
          user: null,
          token: null,
          message: "PIN must contain exactly 4 digits.",
        });
      }

      const bcrypt = require("bcryptjs");

      // 1. If guestId provided from local storage, try matching first
      if (guestId) {
        const existingUser = await User._get({ username: String(guestId) });
        if (
          existingUser &&
          existingUser.role === "guest" &&
          bcrypt.compareSync(cleanPin, existingUser.password)
        ) {
          failedPinAttempts.delete(lockKey);
          const sessionToken = makeJWT(
            { id: existingUser.id, username: existingUser.username },
            process.env.JWT_EXPIRY
          );
          return response.status(200).json({
            isExisting: true,
            user: User.filterFields(existingUser),
            token: sessionToken,
            guestId: existingUser.username,
            message: null,
          });
        }
      }

      // 2. Query guest accounts to see if PIN belongs to any existing guest
      const allGuestUsers = await prisma.users.findMany({
        where: { role: "guest" },
      });

      const matchedGuest = allGuestUsers.find((u) =>
        bcrypt.compareSync(cleanPin, u.password)
      );

      if (matchedGuest) {
        failedPinAttempts.delete(lockKey);
        const sessionToken = makeJWT(
          { id: matchedGuest.id, username: matchedGuest.username },
          process.env.JWT_EXPIRY
        );
        return response.status(200).json({
          isExisting: true,
          user: User.filterFields(matchedGuest),
          token: sessionToken,
          guestId: matchedGuest.username,
          message: null,
        });
      }

      // 3. No existing guest account found for this PIN
      return response.status(200).json({
        isExisting: false,
        user: null,
        token: null,
        message: null,
      });
    } catch (e) {
      console.error("Guest PIN lookup error:", e);
      return response.status(500).json({
        isExisting: false,
        user: null,
        token: null,
        message: e.message || "Failed to verify PIN.",
      });
    }
  });

  // GUEST MODE: Update guest profile name / display name
  app.post(
    "/request-token/guest/update-name",
    [validatedRequest],
    async (request, response) => {
      try {
        const currentUser = response.locals.user;
        const { name } = reqBody(request);

        if (!name || !String(name).trim()) {
          return response.status(400).json({
            success: false,
            message: "Display name cannot be empty.",
          });
        }

        const newName = String(name).trim();
        const updatedUser = await User.update(currentUser.id, {
          bio: newName,
        });

        if (updatedUser?.error) {
          return response.status(400).json({
            success: false,
            message: updatedUser.error,
          });
        }

        const userFiltered = User.filterFields({
          ...currentUser,
          bio: newName,
          name: newName,
        });

        return response.status(200).json({
          success: true,
          user: userFiltered,
          message: "Profile updated successfully.",
        });
      } catch (e) {
        console.error("Failed to update guest name:", e);
        return response.status(500).json({
          success: false,
          message: e.message || "Failed to update profile name.",
        });
      }
    }
  );

  // GUEST MODE: Returning Guest Login with 4-Digit PIN & Rate-Limit Lockout
  app.post("/request-token/guest/login", async (request, response) => {
    try {
      const { guestId, pin } = reqBody(request);
      const clientIp = request.ip || "unknown_ip";
      const lockKey = `${clientIp}_${guestId}`;
      const now = Date.now();

      const record = failedPinAttempts.get(lockKey);
      if (record && record.lockUntil > now) {
        const remainingMinutes = Math.ceil(
          (record.lockUntil - now) / (60 * 1000)
        );
        return response.status(429).json({
          valid: false,
          token: null,
          message: `Too many failed PIN attempts. Locked out for ${remainingMinutes} minute(s).`,
        });
      }

      if (!guestId || !pin) {
        return response.status(400).json({
          valid: false,
          token: null,
          message: "Guest session ID and 4-digit PIN are required.",
        });
      }

      const cleanPin = String(pin).trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return response.status(400).json({
          valid: false,
          token: null,
          message: "PIN must contain exactly 4 digits.",
        });
      }

      const existingUser = await User._get({ username: String(guestId) });
      if (!existingUser || existingUser.role !== "guest") {
        return response.status(200).json({
          valid: false,
          token: null,
          message: "Invalid guest session ID or PIN.",
        });
      }

      const bcrypt = require("bcryptjs");
      if (!bcrypt.compareSync(cleanPin, existingUser.password)) {
        const currentCount = (record?.count || 0) + 1;
        let lockUntil = 0;
        if (currentCount >= 5) {
          lockUntil = now + 15 * 60 * 1000; // 15-minute temporary lockout
        }
        failedPinAttempts.set(lockKey, { count: currentCount, lockUntil });

        return response.status(200).json({
          valid: false,
          token: null,
          message:
            lockUntil > 0
              ? "Too many failed PIN attempts. Locked out for 15 minutes."
              : `Invalid 4-digit PIN. ${5 - currentCount} attempt(s) remaining.`,
        });
      }

      // Successful login resets failure count
      failedPinAttempts.delete(lockKey);

      const sessionToken = makeJWT(
        { id: existingUser.id, username: existingUser.username },
        process.env.JWT_EXPIRY
      );

      return response.status(200).json({
        valid: true,
        user: User.filterFields(existingUser),
        token: sessionToken,
        guestId: existingUser.username,
        message: null,
      });
    } catch (e) {
      console.error("Guest login error:", e);
      return response.status(500).json({
        valid: false,
        token: null,
        message: e.message || "Server error during guest login.",
      });
    }
  });

  // GUEST MODE: Upgrade Guest Account -> Permanent Email/Password Account
  app.post(
    "/request-token/guest/upgrade",
    [validatedRequest],
    async (request, response) => {
      try {
        const currentUser = response.locals.user;
        if (!currentUser || currentUser.role !== "guest") {
          return response.status(400).json({
            success: false,
            message: "Only guest accounts can be upgraded.",
          });
        }

        const { email, password, name } = reqBody(request);
        if (!email || !password) {
          return response.status(400).json({
            success: false,
            message: "Email and password are required.",
          });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if (!emailRegex.test(cleanEmail)) {
          return response.status(400).json({
            success: false,
            message: "Please enter a valid email address.",
          });
        }

        const passwordCheck = User.checkPasswordComplexity(password);
        if (!passwordCheck.checkedOK) {
          return response.status(400).json({
            success: false,
            message: passwordCheck.error,
          });
        }

        // Verify email isn't taken by another account
        const existing = await User.get({ username: cleanEmail });
        if (existing && existing.id !== currentUser.id) {
          return response.status(400).json({
            success: false,
            message: "A user with that email address already exists.",
          });
        }

        const bcrypt = require("bcryptjs");
        const hashedPassword = bcrypt.hashSync(password, 10);
        const updatedUser = await prisma.users.update({
          where: { id: currentUser.id },
          data: {
            username: cleanEmail,
            password: hashedPassword,
            role: "default",
            bio: name ? String(name).trim() : currentUser.bio || "",
          },
        });

        const sessionToken = makeJWT(
          { id: updatedUser.id, username: updatedUser.username },
          process.env.JWT_EXPIRY
        );

        const { EventLogs } = require("../models/eventLogs");
        await EventLogs.logEvent(
          "guest_account_upgraded",
          {
            ip: request.ip || "Unknown IP",
            username: updatedUser.username,
          },
          updatedUser.id
        );

        return response.status(200).json({
          success: true,
          user: User.filterFields(updatedUser),
          token: sessionToken,
          message: null,
        });
      } catch (e) {
        console.error("Guest upgrade error:", e);
        return response.status(500).json({
          success: false,
          message: e.message || "Failed to upgrade account.",
        });
      }
    }
  );

  app.post("/request-token", async (request, response) => {
    try {
      const bcrypt = require("bcryptjs");
      const { username, password } = reqBody(request);
      const cleanUsername = String(username || "").trim();

      // Check if user exists by username or email in database
      const existingUser = cleanUsername
        ? await User._get({
            OR: [
              { username: cleanUsername },
              { username: cleanUsername.toLowerCase() },
            ],
          })
        : null;

      if (existingUser) {
        if (!bcrypt.compareSync(String(password), existingUser.password)) {
          await EventLogs.logEvent(
            "failed_login_invalid_password",
            {
              ip: request.ip || "Unknown IP",
              username: cleanUsername,
            },
            existingUser?.id
          );
          response.status(401).json({
            user: null,
            valid: false,
            token: null,
            message: "Invalid email or password.",
          });
          return;
        }

        if (existingUser.suspended) {
          response.status(403).json({
            user: null,
            valid: false,
            token: null,
            message: "Account suspended by admin.",
          });
          return;
        }

        const sessionToken = makeJWT(
          { id: existingUser.id, username: existingUser.username },
          process.env.JWT_EXPIRY
        );

        response.status(200).json({
          valid: true,
          user: User.filterFields(existingUser),
          token: sessionToken,
          message: null,
        });
        return;
      }

      if (await SystemSettings.isMultiUserMode()) {
        if (simpleSSOLoginDisabled()) {
          response.status(403).json({
            user: null,
            valid: false,
            token: null,
            message:
              "[005] Login via credentials has been disabled by the administrator.",
          });
          return;
        }

        response.status(401).json({
          user: null,
          valid: false,
          token: null,
          message: "Invalid email or password.",
        });
        return;
      } else {
        const { password } = reqBody(request);
        const authToken = process.env.AUTH_TOKEN || "";
        if (
          !password ||
          !authToken ||
          !bcrypt.compareSync(
            String(password),
            bcrypt.hashSync(String(authToken), 10)
          )
        ) {
          await EventLogs.logEvent("failed_login_invalid_password", {
            ip: request.ip || "Unknown IP",
            multiUserMode: false,
          });
          response.status(401).json({
            valid: false,
            token: null,
            message: "[003] Invalid password provided",
          });
          return;
        }

        await Telemetry.sendTelemetry("login_event", { multiUserMode: false });
        await EventLogs.logEvent("login_event", {
          ip: request.ip || "Unknown IP",
          multiUserMode: false,
        });
        response.status(200).json({
          valid: true,
          token: makeJWT(
            { p: new EncryptionManager().encrypt(password) },
            process.env.JWT_EXPIRY
          ),
          message: null,
        });
      }
    } catch (e) {
      console.error(e.message, e);
      response.status(500).json({ valid: false, message: e.message || "Internal Server Error" });
    }
  });

  app.get(
    "/request-token/sso/simple",
    [simpleSSOEnabled],
    async (request, response) => {
      const { token: tempAuthToken } = request.query;
      const { sessionToken, token, error } =
        await TemporaryAuthToken.validate(tempAuthToken);

      if (error) {
        await EventLogs.logEvent("failed_login_invalid_temporary_auth_token", {
          ip: request.ip || "Unknown IP",
          multiUserMode: true,
        });
        return response.status(401).json({
          valid: false,
          token: null,
          message: `[001] An error occurred while validating the token: ${error}`,
        });
      }

      await Telemetry.sendTelemetry(
        "login_event",
        { multiUserMode: true },
        token.user.id
      );
      await EventLogs.logEvent(
        "login_event",
        {
          ip: request.ip || "Unknown IP",
          username: token.user.username || "Unknown user",
        },
        token.user.id
      );

      response.status(200).json({
        valid: true,
        user: User.filterFields(token.user),
        token: sessionToken,
        message: null,
      });
    }
  );

  app.post(
    "/system/recover-account",
    async (request, response) => {
      try {
        const { username } = reqBody(request);
        const { success, resetToken, error } = await recoverAccount(username);

        if (success) {
          response.status(200).json({ success: true, resetToken });
        } else {
          response.status(400).json({ success: false, message: error || "Account recovery failed." });
        }
      } catch (error) {
        console.error("Error recovering account:", error);
        response
          .status(500)
          .json({ success: false, message: error.message || "Internal server error" });
      }
    }
  );

  app.post(
    "/system/reset-password",
    async (request, response) => {
      try {
        const { token, newPassword, confirmPassword } = reqBody(request);
        const { success, message, error } = await resetPassword(
          token,
          newPassword,
          confirmPassword
        );

        if (success) {
          response.status(200).json({ success: true, message: message || "Password reset successful." });
        } else {
          response.status(400).json({ success: false, message: error || message || "Password reset failed." });
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        response.status(500).json({ success: false, message: error.message || "Internal server error" });
      }
    }
  );

  app.get(
    "/system/system-vectors",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const query = queryParams(request);
        const VectorDb = getVectorDbClass();
        const vectorCount = !!query.slug
          ? await VectorDb.namespaceCount(query.slug)
          : await VectorDb.totalVectors();
        response.status(200).json({ vectorCount });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/system/remove-document",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { name } = reqBody(request);
        await purgeDocument(name);
        response.sendStatus(200).end();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/system/remove-documents",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { names } = reqBody(request);
        for await (const name of names) await purgeDocument(name);
        response.sendStatus(200).end();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/system/remove-folder",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { name } = reqBody(request);
        await purgeFolder(name);
        response.sendStatus(200).end();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/system/local-files",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { folder, offset, limit } = queryParams(request);
        if (folder) {
          // Passed through as-is: getDocumentsByFolder clamps the window and
          // understands `limit=all`.
          const result = await getDocumentsByFolder(folder, { offset, limit });
          response.status(result.code).json(result);
        } else {
          const localFiles = listFolders();
          response.status(200).json({ localFiles });
        }
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/system/local-files/search",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { q } = queryParams(request);
        const results = await searchDocuments(q);
        response.status(200).json({ results });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/system/local-files/by-docpaths",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { docpaths = [] } = reqBody(request);
        const documents = await getDocumentsByDocPaths(docpaths);
        response.status(200).json({ documents });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/system/document-processing-status",
    [validatedRequest],
    async (_, response) => {
      try {
        const online = await new CollectorApi().online();
        const isOnline =
          online ||
          global.collectorOnline === true ||
          process.env.DISABLE_EMBEDDED_COLLECTOR !== "true";
        response.sendStatus(isOnline ? 200 : 503);
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(200);
      }
    }
  );

  app.get(
    "/system/accepted-document-types",
    [validatedRequest],
    async (_, response) => {
      try {
        const types = await new CollectorApi().acceptedFileTypes();
        if (!types) {
          response.sendStatus(404).end();
          return;
        }

        response.status(200).json({ types });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/system/update-env",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { newValues, error } = await updateENV(
          body,
          false,
          response?.locals?.user?.id
        );
        response.status(200).json({ newValues, error });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/system/update-password",
    [validatedRequest],
    async (request, response) => {
      try {
        // Cannot update password in multi - user mode.
        if (multiUserMode(response)) {
          response.sendStatus(401).end();
          return;
        }

        let error = null;
        const { usePassword, newPassword } = reqBody(request);
        if (!usePassword) {
          // Password is being disabled so directly unset everything to bypass validation.
          process.env.AUTH_TOKEN = "";
          process.env.JWT_SECRET = "";
        } else {
          error = await updateENV(
            {
              AuthToken: newPassword,
              JWTSecret: v4(),
            },
            true
          )?.error;
        }
        response.status(200).json({ success: !error, error });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/system/enable-multi-user",
    [validatedRequest],
    async (request, response) => {
      try {
        if (response.locals.multiUserMode) {
          response.status(200).json({
            success: false,
            error: "Multi-user mode is already enabled.",
          });
          return;
        }

        const { username, password } = reqBody(request);
        const { user, error } = await User.create({
          username,
          password,
          role: ROLES.admin,
        });

        if (error || !user) {
          response.status(400).json({
            success: false,
            error: error || "Failed to enable multi-user mode.",
          });
          return;
        }

        await SystemSettings._updateSettings({
          multi_user_mode: true,
        });
        await BrowserExtensionApiKey.migrateApiKeysToMultiUser(user.id);
        await Memory.migrateToMultiUser(user.id);
        await WorkspaceChats.migrateToMultiUser(user.id);
        await MobileDevice.migrateDevicesToMultiUser(user.id);
        await SlashCommandPresets.migrateToMultiUser(user.id);
        await AgentSkillWhitelist.clearSingleUserWhitelist();
        await updateENV(
          {
            JWTSecret: process.env.JWT_SECRET || v4(),
          },
          true
        );
        await Telemetry.sendTelemetry("enabled_multi_user_mode", {
          multiUserMode: true,
        });
        await EventLogs.logEvent("multi_user_mode_enabled", {}, user?.id);
        response.status(200).json({ success: !!user, error });
      } catch (e) {
        await User.delete({});
        await SystemSettings._updateSettings({
          multi_user_mode: false,
        });

        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get("/system/multi-user-mode", async (_, response) => {
    try {
      const multiUserMode = await SystemSettings.isMultiUserMode();
      response.status(200).json({ multiUserMode });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/system/logo", async function (request, response) {
    try {
      const darkMode =
        !request?.query?.theme ||
        request?.query?.theme === "default" ||
        request?.query?.theme === "dark" ||
        request?.query?.theme === "system";
      const defaultFilename = getDefaultFilename(darkMode);
      const logoPath = await determineLogoFilepath(defaultFilename);
      const { found, buffer, size, mime } = fetchLogo(logoPath);

      if (!found) {
        response.sendStatus(204).end();
        return;
      }

      const currentLogoFilename = await SystemSettings.currentLogoFilename();
      response.writeHead(200, {
        "Access-Control-Expose-Headers":
          "Content-Disposition,X-Is-Custom-Logo,Content-Type,Content-Length",
        "Content-Type": mime || "image/png",
        "Content-Disposition": `attachment; filename=${path.basename(
          logoPath
        )}`,
        "Content-Length": size,
        "X-Is-Custom-Logo":
          currentLogoFilename !== null &&
          currentLogoFilename !== defaultFilename &&
          !isDefaultFilename(currentLogoFilename),
      });
      response.end(Buffer.from(buffer, "base64"));
      return;
    } catch (error) {
      console.error("Error processing the logo request:", error);
      response.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/system/footer-data", [validatedRequest], async (_, response) => {
    try {
      const footerData =
        (await SystemSettings.get({ label: "footer_data" }))?.value ??
        JSON.stringify([]);
      response.status(200).json({ footerData: footerData });
    } catch (error) {
      console.error("Error fetching footer data:", error);
      response.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/system/support-email", [validatedRequest], async (_, response) => {
    try {
      const supportEmail =
        (
          await SystemSettings.get({
            label: "support_email",
          })
        )?.value ?? null;
      response.status(200).json({ supportEmail: supportEmail });
    } catch (error) {
      console.error("Error fetching support email:", error);
      response.status(500).json({ message: "Internal server error" });
    }
  });

  // No middleware protection in order to get this on the login page
  app.get("/system/custom-app-name", async (_, response) => {
    try {
      const customAppName =
        (
          await SystemSettings.get({
            label: "custom_app_name",
          })
        )?.value ?? null;
      response.status(200).json({ customAppName: customAppName });
    } catch (error) {
      console.error("Error fetching custom app name:", error);
      response.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/system/pfp/:id",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async function (request, response) {
      try {
        const { id } = request.params;
        if (response.locals?.user?.id !== Number(id))
          return response.sendStatus(204).end();

        const pfpPath = await determinePfpFilepath(id);
        if (!pfpPath) return response.sendStatus(204).end();

        const { found, buffer, size, mime } = fetchPfp(pfpPath);
        if (!found) return response.sendStatus(204).end();

        response.writeHead(200, {
          "Content-Type": mime || "image/png",
          "Content-Disposition": `attachment; filename=${path.basename(pfpPath)}`,
          "Content-Length": size,
        });
        response.end(Buffer.from(buffer, "base64"));
        return;
      } catch (error) {
        console.error("Error processing the logo request:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/system/upload-pfp",
    [validatedRequest, flexUserRoleValid([ROLES.all]), handlePfpUpload],
    async function (request, response) {
      try {
        const user = await userFromSession(request, response);
        const uploadedFileName = request.randomFileName;
        if (!uploadedFileName) {
          return response.status(400).json({ message: "File upload failed." });
        }

        const userRecord = await User.get({ id: user.id });
        const oldPfpFilename = userRecord.pfpFilename;
        if (oldPfpFilename) {
          const storagePath = path.join(__dirname, "../storage/assets/pfp");
          const oldPfpPath = path.join(
            storagePath,
            normalizePath(userRecord.pfpFilename)
          );
          if (!isWithin(path.resolve(storagePath), path.resolve(oldPfpPath)))
            throw new Error("Invalid path name");
          if (fs.existsSync(oldPfpPath)) fs.unlinkSync(oldPfpPath);
        }

        const { success, error } = await User.update(user.id, {
          pfpFilename: uploadedFileName,
        });

        return response.status(success ? 200 : 500).json({
          message: success
            ? "Profile picture uploaded successfully."
            : error || "Failed to update with new profile picture.",
        });
      } catch (error) {
        console.error("Error processing the profile picture upload:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );
  app.get(
    "/system/default-system-prompt",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (_, response) => {
      try {
        const defaultSystemPrompt = await SystemSettings.get({
          label: "default_system_prompt",
        });

        response.status(200).json({
          success: true,
          defaultSystemPrompt:
            defaultSystemPrompt?.value ||
            SystemSettings.saneDefaultSystemPrompt,
          saneDefaultSystemPrompt: SystemSettings.saneDefaultSystemPrompt,
        });
      } catch (error) {
        console.error("Error fetching default system prompt:", error);
        response
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );

  app.post(
    "/system/default-system-prompt",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { defaultSystemPrompt } = reqBody(request);
        const { success, error } = await SystemSettings.updateSettings({
          default_system_prompt: defaultSystemPrompt,
        });
        if (!success)
          throw new Error(
            error.message || "Failed to update default system prompt."
          );
        response.status(200).json({
          success: true,
          message: "Default system prompt updated successfully.",
        });
      } catch (error) {
        console.error("Error updating default system prompt:", error);
        response.status(500).json({
          success: false,
          message: error.message || "Internal server error",
        });
      }
    }
  );

  app.delete(
    "/system/remove-pfp",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async function (request, response) {
      try {
        const user = await userFromSession(request, response);
        const userRecord = await User.get({ id: user.id });
        const oldPfpFilename = userRecord.pfpFilename;

        if (oldPfpFilename) {
          const storagePath = path.join(__dirname, "../storage/assets/pfp");
          const oldPfpPath = path.join(
            storagePath,
            normalizePath(oldPfpFilename)
          );
          if (!isWithin(path.resolve(storagePath), path.resolve(oldPfpPath)))
            throw new Error("Invalid path name");
          if (fs.existsSync(oldPfpPath)) fs.unlinkSync(oldPfpPath);
        }

        const { success, error } = await User.update(user.id, {
          pfpFilename: null,
        });

        return response.status(success ? 200 : 500).json({
          message: success
            ? "Profile picture removed successfully."
            : error || "Failed to remove profile picture.",
        });
      } catch (error) {
        console.error("Error processing the profile picture removal:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/system/upload-logo",
    [
      validatedRequest,
      flexUserRoleValid([ROLES.admin, ROLES.manager]),
      handleAssetUpload,
    ],
    async (request, response) => {
      if (!request?.file || !request?.file.originalname) {
        return response.status(400).json({ message: "No logo file provided." });
      }

      if (!validFilename(request.file.originalname)) {
        return response.status(400).json({
          message: "Invalid file name. Please choose a different file.",
        });
      }

      try {
        const newFilename = await renameLogoFile(request.file.originalname);
        const existingLogoFilename = await SystemSettings.currentLogoFilename();
        await removeCustomLogo(existingLogoFilename);

        const { success, error } = await SystemSettings._updateSettings({
          logo_filename: newFilename,
        });

        return response.status(success ? 200 : 500).json({
          message: success
            ? "Logo uploaded successfully."
            : error || "Failed to update with new logo.",
        });
      } catch (error) {
        console.error("Error processing the logo upload:", error);
        response.status(500).json({ message: "Error uploading the logo." });
      }
    }
  );

  app.get("/system/is-default-logo", async (_, response) => {
    try {
      const currentLogoFilename = await SystemSettings.currentLogoFilename();
      const isDefaultLogo =
        !currentLogoFilename || currentLogoFilename === LOGO_FILENAME;
      response.status(200).json({ isDefaultLogo });
    } catch (error) {
      console.error("Error processing the logo request:", error);
      response.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/system/remove-logo",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (_request, response) => {
      try {
        const currentLogoFilename = await SystemSettings.currentLogoFilename();
        await removeCustomLogo(currentLogoFilename);
        const { success, error } = await SystemSettings._updateSettings({
          logo_filename: LOGO_FILENAME,
        });

        return response.status(success ? 200 : 500).json({
          message: success
            ? "Logo removed successfully."
            : error || "Failed to update with new logo.",
        });
      } catch (error) {
        console.error("Error processing the logo removal:", error);
        response.status(500).json({ message: "Error removing the logo." });
      }
    }
  );

  app.get("/system/api-keys", [validatedRequest], async (_, response) => {
    try {
      if (response.locals.multiUserMode) {
        return response.sendStatus(401).end();
      }

      const apiKeys = await ApiKey.where({});
      return response.status(200).json({
        apiKeys,
        error: null,
      });
    } catch (error) {
      console.error(error);
      response.status(500).json({
        apiKey: null,
        error: "Could not find an API Key.",
      });
    }
  });

  app.post(
    "/system/generate-api-key",
    [validatedRequest],
    async (request, response) => {
      try {
        if (response.locals.multiUserMode) {
          return response.sendStatus(401).end();
        }

        const { name = null } = reqBody(request);
        const { apiKey, error } = await ApiKey.create(null, name);
        await EventLogs.logEvent(
          "api_key_created",
          { name: apiKey?.name },
          response?.locals?.user?.id
        );
        return response.status(200).json({
          apiKey,
          error,
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({
          apiKey: null,
          error: "Error generating api key.",
        });
      }
    }
  );

  // TODO: This endpoint is replicated in the admin endpoints file.
  // and should be consolidated to be a single endpoint with flexible role protection.
  app.delete(
    "/system/api-key/:id",
    [validatedRequest],
    async (request, response) => {
      try {
        if (response.locals.multiUserMode)
          return response.sendStatus(401).end();
        const { id } = request.params;
        if (!id || isNaN(Number(id))) return response.sendStatus(400).end();

        await ApiKey.delete({ id: Number(id) });
        await EventLogs.logEvent(
          "api_key_deleted",
          { deletedBy: response.locals?.user?.username },
          response?.locals?.user?.id
        );
        return response.status(200).end();
      } catch (error) {
        console.error(error);
        response.status(500).end();
      }
    }
  );

  app.post(
    "/system/custom-models",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const {
          provider,
          apiKey = null,
          basePath = null,
          options = {},
        } = reqBody(request);
        const { models, error } = await getCustomModels(
          provider,
          apiKey,
          basePath,
          options
        );
        return response.status(200).json({
          models,
          error,
        });
      } catch (error) {
        console.error(error);
        response.status(500).end();
      }
    }
  );

  app.post(
    "/system/event-logs",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { offset = 0, limit = 10 } = reqBody(request);
        const logs = await EventLogs.whereWithData({}, limit, offset * limit, {
          id: "desc",
        });
        const totalLogs = await EventLogs.count();
        const hasPages = totalLogs > (offset + 1) * limit;

        response.status(200).json({ logs: logs, hasPages, totalLogs });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/system/event-logs",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      try {
        await EventLogs.delete();
        await EventLogs.logEvent(
          "event_logs_cleared",
          {},
          response?.locals?.user?.id
        );
        response.json({ success: true });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/system/workspace-chats",
    [
      chatHistoryViewable,
      validatedRequest,
      flexUserRoleValid([ROLES.admin, ROLES.manager]),
    ],
    async (request, response) => {
      try {
        const { offset = 0, limit = 20 } = reqBody(request);
        const chats = await WorkspaceChats.whereWithData(
          {},
          limit,
          offset * limit,
          { id: "desc" }
        );
        const totalChats = await WorkspaceChats.count();
        const hasPages = totalChats > (offset + 1) * limit;

        response.status(200).json({ chats: chats, hasPages, totalChats });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/system/workspace-chats/:id",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { id } = request.params;
        Number(id) === -1
          ? await WorkspaceChats.delete({}, true)
          : await WorkspaceChats.delete({ id: Number(id) });
        response.json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/system/export-chats",
    [
      chatHistoryViewable,
      validatedRequest,
      flexUserRoleValid([ROLES.manager, ROLES.admin]),
    ],
    async (request, response) => {
      try {
        const { type = "jsonl", chatType = "workspace" } = request.query;
        const { contentType, data } = await exportChatsAsType(type, chatType);
        await EventLogs.logEvent(
          "exported_chats",
          {
            type,
            chatType,
          },
          response.locals.user?.id
        );
        response.setHeader("Content-Type", contentType);
        response.status(200).send(data);
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  // Used for when a user in multi-user updates their own profile
  // from the UI.
  app.post("/system/user", [validatedRequest], async (request, response) => {
    try {
      const sessionUser = await userFromSession(request, response);
      const { username, password, bio } = reqBody(request);
      const id = Number(sessionUser.id);

      if (!id) {
        response.status(400).json({ success: false, error: "Invalid user ID" });
        return;
      }

      const updates = {};
      // If the username is being changed, validate it.
      // Otherwise, do not attempt to validate it to allow existing users to keep their username if not changing it.
      if (username !== sessionUser.username)
        updates.username = User.validations.username(String(username));
      if (password) updates.password = String(password);
      if (bio) updates.bio = String(bio);

      if (Object.keys(updates).length === 0) {
        response
          .status(400)
          .json({ success: false, error: "No updates provided" });
        return;
      }

      const { success, error } = await User.update(id, updates);
      response.status(200).json({ success, error });
    } catch (e) {
      console.error(e);
      response
        .status(500)
        .json({ success: false, error: e.message || "Internal server error" });
    }
  });

  app.get(
    "/system/slash-command-presets",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const userPresets = await SlashCommandPresets.getUserPresets(user?.id);
        response.status(200).json({ presets: userPresets });
      } catch (error) {
        console.error("Error fetching slash command presets:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/system/slash-command-presets",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { command, prompt, description } = reqBody(request);
        const formattedCommand = SlashCommandPresets.formatCommand(
          String(command)
        );

        if (Object.keys(VALID_COMMANDS).includes(formattedCommand)) {
          return response.status(400).json({
            message:
              "Cannot create a preset with a command that matches a system command",
          });
        }

        const presetData = {
          command: formattedCommand,
          prompt: String(prompt),
          description: String(description),
        };

        const preset = await SlashCommandPresets.create(user?.id, presetData);
        if (!preset) {
          return response
            .status(500)
            .json({ message: "Failed to create preset" });
        }
        response.status(201).json({ preset });
      } catch (error) {
        console.error("Error creating slash command preset:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/system/slash-command-presets/:slashCommandId",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { slashCommandId } = request.params;
        const { command, prompt, description } = reqBody(request);
        const formattedCommand = SlashCommandPresets.formatCommand(
          String(command)
        );

        if (Object.keys(VALID_COMMANDS).includes(formattedCommand)) {
          return response.status(400).json({
            message:
              "Cannot update a preset to use a command that matches a system command",
          });
        }

        // Valid user running owns the preset if user session is valid.
        const ownsPreset = await SlashCommandPresets.get({
          userId: user?.id ?? null,
          id: Number(slashCommandId),
        });
        if (!ownsPreset)
          return response.status(404).json({ message: "Preset not found" });

        const updates = {
          command: formattedCommand,
          prompt: String(prompt),
          description: String(description),
        };

        const preset = await SlashCommandPresets.update(
          Number(slashCommandId),
          updates
        );
        if (!preset) return response.sendStatus(422);
        response.status(200).json({ preset: { ...ownsPreset, ...updates } });
      } catch (error) {
        console.error("Error updating slash command preset:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete(
    "/system/slash-command-presets/:slashCommandId",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { slashCommandId } = request.params;
        const user = await userFromSession(request, response);

        // Valid user running owns the preset if user session is valid.
        const ownsPreset = await SlashCommandPresets.get({
          userId: user?.id ?? null,
          id: Number(slashCommandId),
        });
        if (!ownsPreset)
          return response
            .status(403)
            .json({ message: "Failed to delete preset" });

        await SlashCommandPresets.delete(Number(slashCommandId));
        response.sendStatus(204);
      } catch (error) {
        console.error("Error deleting slash command preset:", error);
        response.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get(
    "/system/prompt-variables",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const variables = await SystemPromptVariables.getAll(user?.id);
        response.status(200).json({ variables });
      } catch (error) {
        console.error("Error fetching system prompt variables:", error);
        response.status(500).json({
          success: false,
          error: `Failed to fetch system prompt variables: ${error.message}`,
        });
      }
    }
  );

  app.post(
    "/system/prompt-variables",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { key, value, description = null } = reqBody(request);

        if (!key || !value) {
          return response.status(400).json({
            success: false,
            error: "Key and value are required",
          });
        }

        const variable = await SystemPromptVariables.create({
          key,
          value,
          description,
          userId: user?.id || null,
        });

        response.status(200).json({
          success: true,
          variable,
        });
      } catch (error) {
        console.error("Error creating system prompt variable:", error);
        response.status(500).json({
          success: false,
          error: `Failed to create system prompt variable: ${error.message}`,
        });
      }
    }
  );

  app.put(
    "/system/prompt-variables/:id",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const { key, value, description = null } = reqBody(request);

        if (!key || !value) {
          return response.status(400).json({
            success: false,
            error: "Key and value are required",
          });
        }

        const variable = await SystemPromptVariables.update(Number(id), {
          key,
          value,
          description,
        });

        if (!variable) {
          return response.status(404).json({
            success: false,
            error: "Variable not found",
          });
        }

        response.status(200).json({
          success: true,
          variable,
        });
      } catch (error) {
        console.error("Error updating system prompt variable:", error);
        response.status(500).json({
          success: false,
          error: `Failed to update system prompt variable: ${error.message}`,
        });
      }
    }
  );

  app.delete(
    "/system/prompt-variables/:id",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const success = await SystemPromptVariables.delete(Number(id));

        if (!success) {
          return response.status(404).json({
            success: false,
            error: "System prompt variable not found or could not be deleted",
          });
        }

        response.status(200).json({
          success: true,
        });
      } catch (error) {
        console.error("Error deleting system prompt variable:", error);
        response.status(500).json({
          success: false,
          error: `Failed to delete system prompt variable: ${error.message}`,
        });
      }
    }
  );

  app.post(
    "/system/transcribe-audio",
    [validatedRequest, flexUserRoleValid([ROLES.all]), handleAudioUpload],
    async (request, response) => {
      try {
        if (!request.file?.buffer) {
          return response
            .status(400)
            .json({ success: false, error: "No audio file provided." });
        }

        const provider = process.env.STT_PROVIDER || "native";
        if (provider === "native") {
          return response.status(400).json({
            success: false,
            error:
              "Server-side transcription is disabled. Set STT_PROVIDER to a supported provider.",
          });
        }

        const { getSTTProvider } = require("../utils/SpeechToText");
        const stt = getSTTProvider();
        const text = await stt.transcribe(
          request.file.buffer,
          request.file.originalname || "audio.webm"
        );
        return response.status(200).json({ success: true, text });
      } catch (error) {
        console.error("STT transcription error:", error);
        return response.status(500).json({
          success: false,
          error: error.message || "Transcription failed",
        });
      }
    }
  );

  app.post(
    "/system/validate-sql-connection",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      const { engine, connectionString } = reqBody(request);
      try {
        if (!engine || !connectionString) {
          return response.status(400).json({
            success: false,
            error: "Both engine and connection details are required.",
          });
        }

        const {
          validateConnection,
        } = require("../utils/agents/aibitat/plugins/sql-agent/SQLConnectors");
        const result = await validateConnection(engine, { connectionString });

        if (!result.success) {
          return response.status(200).json({
            success: false,
            error: `Unable to connect to ${engine}. Please verify your connection details.`,
          });
        }

        response.status(200).json(result);
      } catch (error) {
        console.error("SQL validation error:", error);
        response.status(500).json({
          success: false,
          error: `Unable to connect to ${engine}. Please verify your connection details.`,
        });
      }
    }
  );
}

module.exports = { systemEndpoints };
