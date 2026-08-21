const nodemailer = require("nodemailer");
const path = require("path");

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    require("dotenv").config({ path: path.join(__dirname, "../../.env") });
  }

  const service = process.env.EMAIL_SERVICE || "gmail";
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    console.error(
      "[Mailer Config Error] EMAIL_USER or EMAIL_PASS missing in server/.env"
    );
    return null;
  }

  return nodemailer.createTransport({
    service,
    auth: {
      user,
      pass,
    },
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      `[Mailer Warning] Nodemailer is not fully configured (EMAIL_USER or EMAIL_PASS missing). Reset URL: ${resetUrl}`
    );
    return { success: false, reason: "Nodemailer credentials not configured." };
  }

  const mailOptions = {
    from: `"ContextIQ Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your ContextIQ Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #171717; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #262626; border: 1px solid #333333; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 700; color: #3b82f6; margin-bottom: 24px; display: inline-block; }
          h2 { font-size: 22px; font-weight: 400; color: #f5f5f5; margin-top: 0; margin-bottom: 12px; }
          p { font-size: 15px; color: #a3a3a3; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; transition: background-color 0.2s ease; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #333333; font-size: 12px; color: #737373; text-align: center; }
          .link-alt { font-size: 12px; word-break: break-all; color: #60a5fa; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ContextIQ</div>
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your ContextIQ account (<strong>${to}</strong>). Click the button below to choose a new password. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <div class="link-alt">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #60a5fa;">${resetUrl}</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ContextIQ. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer Success] Password reset email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Mailer Error] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendPasswordResetEmail,
};
