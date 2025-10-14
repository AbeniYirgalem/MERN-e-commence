const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateTokenId,
} = require("../utils/tokenService");
const RefreshToken = require("../models/RefreshToken"); // fallback DB model
const refreshStore = require("../services/refreshTokenStore");
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Issue tokens and set httpOnly cookie
exports.issueTokens = async function (res, user) {
  const tokenId = generateTokenId();
  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id, jti: tokenId });

  // Persist refresh token server-side (Redis preferred, DB fallback)
  const ttl = 7 * 24 * 60 * 60 * 1000;
  await refreshStore.save(tokenId, user._id, ttl);

  // Set cookie (httpOnly, secure in production) - cookie is used to send refresh token to server
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken };
};

// Refresh token route handler
exports.refreshTokenHandler = async function (req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    const payload = verifyRefreshToken(refreshToken);
    const tokenId = payload.jti;

    // Check server-side store (Redis preferred)
    const stored = await refreshStore.get(tokenId);
    if (!stored) {
      logger.warn({ tokenId }, "Refresh token not found in store");
      return res
        .status(401)
        .json({ message: "Refresh token revoked or not found" });
    }

    // Rotate: revoke old token and issue new pair
    await refreshStore.revoke(tokenId);

    const newTokenId = generateTokenId();
    const ttlNew = 7 * 24 * 60 * 60 * 1000;
    await refreshStore.save(newTokenId, payload.sub, ttlNew);

    const newAccess = signAccessToken({ sub: payload.sub });
    const newRefresh = signRefreshToken({ sub: payload.sub, jti: newTokenId });

    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccess });
  } catch (err) {
    logger.error(err, "Error refreshing token");
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Logout - revoke refresh token
exports.logoutHandler = async function (req, res) {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenId = payload.jti;
      await refreshStore.revoke(tokenId);
    } catch (e) {
      logger.warn(e, "Error revoking refresh token during logout");
    }
  }
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out" });
};
