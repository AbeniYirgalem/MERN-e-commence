const nodemailer = require("nodemailer");

// Create transporter from env config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: process.env.EMAIL_USER
    ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    : undefined,
});

const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || "no-reply@oneafrica.local";
  return transporter.sendMail({ from, to, subject, html, text });
};

const sendVerificationEmail = async (user, token) => {
  const base = process.env.APP_BASE_URL || "http://localhost:4000";
  const url = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const subject = "Verify your OneAfrica account";
  const html = `<p>Hello,</p><p>Please verify your account by clicking <a href="${url}">this link</a>.</p>`;
  return sendMail({ to: user.email, subject, html });
};

const sendPasswordResetEmail = async (user, token) => {
  // Prefer a FRONTEND_URL env (e.g., http://localhost:5173) so the link opens the SPA
  const base =
    process.env.FRONTEND_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:5173";
  // Frontend route for reset expects /reset-password/:token
  const url = `${base.replace(/\/$/, "")}/reset-password/${encodeURIComponent(
    token
  )}`;
  const subject = "Reset your OneAfrica password";
  const html = `<p>Hello,</p><p>You can reset your password by clicking <a href="${url}">this link</a>. If you did not request this, ignore.</p>`;
  return sendMail({ to: user.email, subject, html });
};

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
