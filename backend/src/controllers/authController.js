const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/RefreshToken");
const authTokens = require("./authTokens");
const VerificationToken = require("../models/VerificationToken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/email");

const signTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, password, role = "buyer" } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    // create account in pending state until email verification
    const user = await User.create({
      email,
      password: hashed,
      role,
      status: "pending",
    });

    // Issue tokens and set refresh token cookie
    const issued = await authTokens.issueTokens(res, user);

    // create email verification token (24h expiry)
    const vtoken =
      Math.random().toString(36).slice(2, 16) +
      Math.random().toString(36).slice(2, 16);
    await VerificationToken.create({
      userId: user._id,
      token: vtoken,
      type: "emailVerify",
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    });
    try {
      await sendVerificationEmail(user, vtoken);
    } catch (e) {
      console.error("email send failed", e);
    }

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken: issued.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Block login until email verified
    if (user.status !== "active") {
      return res.status(403).json({
        message:
          "Account not verified. Please check your email for a verification link.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const issued = await authTokens.issueTokens(res, user);
    res.json({
      user: { id: user._id, email: user.email, role: user.role },
      accessToken: issued.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// Rotate refresh token: accept a refresh token, verify and issue new pair
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "refreshToken required" });

    // check persisted token
    const stored = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
    });
    if (!stored)
      return res.status(401).json({ message: "Invalid refresh token" });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // revoke old
    stored.revoked = true;
    await stored.save();

    const { accessToken, refreshToken: newRefresh } = signTokens(user);
    await RefreshToken.create({
      token: newRefresh,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")
      return res.status(401).json({ message: "Invalid refresh token" });
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "refreshToken required" });
    await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// Verify email token
const verify = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "token required" });
    const rec = await VerificationToken.findOne({
      token,
      type: "emailVerify",
      used: false,
    });
    if (!rec) return res.status(400).json({ message: "Invalid or used token" });
    if (rec.expiresAt < new Date())
      return res.status(400).json({ message: "Token expired" });

    const user = await User.findById(rec.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "active";
    await user.save();

    rec.used = true;
    await rec.save();

    res.json({ message: "Email verified" });
  } catch (err) {
    next(err);
  }
};

// Forgot password -> create token and send email
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email required" });
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link was sent" });

    const token =
      Math.random().toString(36).slice(2, 16) +
      Math.random().toString(36).slice(2, 16);
    await VerificationToken.create({
      userId: user._id,
      token,
      type: "passwordReset",
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });
    try {
      await sendPasswordResetEmail(user, token);
    } catch (e) {
      console.error("email send failed", e);
    }
    res.json({ message: "If that email exists, a reset link was sent" });
  } catch (err) {
    next(err);
  }
};

// Reset password using token
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "token and password required" });
    const rec = await VerificationToken.findOne({
      token,
      type: "passwordReset",
      used: false,
    });
    if (!rec) return res.status(400).json({ message: "Invalid or used token" });
    if (rec.expiresAt < new Date())
      return res.status(400).json({ message: "Token expired" });

    const user = await User.findById(rec.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    rec.used = true;
    await rec.save();

    res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  verify,
  forgotPassword,
  resetPassword,
};
