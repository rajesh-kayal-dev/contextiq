const { reqBody, userFromSession } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  ROLES,
  flexUserRoleValid,
} = require("../utils/middleware/multiUserProtected");
const { UserApiKey } = require("../models/userApiKey");

function userApiKeyEndpoints(app) {
  if (!app) return;

  // GET /api/user/keys - List configured providers for current user
  app.get(
    "/user/keys",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          response.status(401).json({ error: "Unauthorized" });
          return;
        }

        const keys = await UserApiKey.getUserKeys(user.id);
        response.status(200).json({ keys });
      } catch (e) {
        console.error("[GET /user/keys Error]:", e);
        response.status(500).json({ error: e.message });
      }
    }
  );

  // POST /api/user/keys - Save/update API key for current user & provider
  app.post(
    "/user/keys",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          response.status(401).json({ error: "Unauthorized" });
          return;
        }

        const { provider, apiKey } = reqBody(request);
        if (!provider || typeof provider !== "string") {
          response.status(400).json({ error: "Provider name is required." });
          return;
        }

        if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
          response.status(400).json({ error: "API key cannot be empty." });
          return;
        }

        await UserApiKey.setKey({
          userId: user.id,
          provider: provider.trim(),
          apiKey: apiKey.trim(),
        });

        response.status(200).json({
          success: true,
          message: `API key saved successfully for ${provider}.`,
          provider: UserApiKey.normalizeProvider(provider),
        });
      } catch (e) {
        console.error("[POST /user/keys Error]:", e);
        response.status(500).json({ error: e.message });
      }
    }
  );

  // GET /api/user/keys/check/:provider - Check if user has API key configured
  app.get(
    "/user/keys/check/:provider",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          response.status(401).json({ error: "Unauthorized" });
          return;
        }

        const { provider } = request.params;
        const hasKey = await UserApiKey.hasKey({
          userId: user.id,
          provider,
        });

        response.status(200).json({
          provider: UserApiKey.normalizeProvider(provider),
          hasKey,
        });
      } catch (e) {
        console.error("[GET /user/keys/check Error]:", e);
        response.status(500).json({ error: e.message });
      }
    }
  );

  // DELETE /api/user/keys/:provider - Delete API key for specified provider
  app.delete(
    "/user/keys/:provider",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          response.status(401).json({ error: "Unauthorized" });
          return;
        }

        const { provider } = request.params;
        await UserApiKey.deleteKey({
          userId: user.id,
          provider,
        });

        response.status(200).json({
          success: true,
          message: `API key deleted for ${provider}.`,
        });
      } catch (e) {
        console.error("[DELETE /user/keys Error]:", e);
        response.status(500).json({ error: e.message });
      }
    }
  );
}

module.exports = { userApiKeyEndpoints };
