const bcrypt = require("bcryptjs");
const { v4, validate } = require("uuid");
const { User } = require("../../models/user");
const {
  RecoveryCode,
  PasswordResetToken,
} = require("../../models/passwordRecovery");
const { sendPasswordResetEmail } = require("../mailer");

async function generateRecoveryCodes(userId) {
  const newRecoveryCodes = [];
  const plainTextCodes = [];
  for (let i = 0; i < 4; i++) {
    const code = v4();
    const hashedCode = bcrypt.hashSync(code, 10);
    newRecoveryCodes.push({
      user_id: userId,
      code_hash: hashedCode,
    });
    plainTextCodes.push(code);
  }

  const { error } = await RecoveryCode.createMany(newRecoveryCodes);
  if (!!error) throw new Error(error);

  const { user: success } = await User._update(userId, {
    seen_recovery_codes: true,
  });
  if (!success) throw new Error("Failed to generate user recovery codes!");

  return plainTextCodes;
}

async function recoverAccount(username = "") {
  const cleanUsername = String(username || "").trim();
  if (!cleanUsername) {
    return { success: false, error: "Email or username is required." };
  }

  const user = await User._get({
    OR: [
      { username: cleanUsername },
      { username: cleanUsername.toLowerCase() },
    ],
  });
  if (!user)
    return {
      success: false,
      error: "No account found with that email or username.",
    };

  // Delete previous reset tokens for this user
  await PasswordResetToken.deleteMany({ user_id: user.id });

  // Generate new 15-minute reset token
  const { passwordResetToken, error } = await PasswordResetToken.create(
    user.id
  );
  if (!!error)
    return { success: false, error: error || "Failed to create reset token." };

  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const resetUrl = `${appUrl}/reset-password?token=${passwordResetToken.token}`;

  // Send HTML password reset email via Nodemailer
  const recipientEmail = user.username.includes("@")
    ? user.username
    : cleanUsername;
  const emailResult = await sendPasswordResetEmail({
    to: recipientEmail,
    resetUrl,
  });

  return {
    success: true,
    resetToken: passwordResetToken.token,
    emailSent: emailResult.success,
  };
}

async function resetPassword(token, _newPassword = "", confirmPassword = "") {
  const newPassword = String(_newPassword).trim();
  if (!newPassword) throw new Error("Invalid password.");
  if (newPassword !== String(confirmPassword))
    throw new Error("Passwords do not match");

  const resetToken = await PasswordResetToken.findUnique({
    token: String(token),
  });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { success: false, message: "Invalid or expired reset token" };
  }

  const { error } = await User.update(resetToken.user_id, {
    password: newPassword,
  });

  if (error) return { success: false, message: error };
  await PasswordResetToken.deleteMany({ user_id: resetToken.user_id });

  return { success: true, message: "Password reset successful" };
}

module.exports = {
  recoverAccount,
  resetPassword,
  generateRecoveryCodes,
};
