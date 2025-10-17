const Redis = require("ioredis");
const mongoose = require("mongoose");
const RefreshTokenModel = require("../models/RefreshToken");

let client;
if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL);
}

const TTL_MS = (ms) => Math.floor(ms / 1000);

module.exports = {
  async save(tokenId, userId, ttlMs) {
    if (client) {
      const key = `refresh:${tokenId}`;
      await client.set(key, String(userId), "EX", TTL_MS(ttlMs));
      return true;
    }
    // fallback to DB
    await RefreshTokenModel.create({
      token: tokenId,
      userId,
      expiresAt: new Date(Date.now() + ttlMs),
    });
    return true;
  },
  async get(tokenId) {
    if (client) {
      const key = `refresh:${tokenId}`;
      const val = await client.get(key);
      if (!val) return null;
      return { userId: val };
    }
    return RefreshTokenModel.findOne({
      token: tokenId,
      revoked: { $ne: true },
    }).lean();
  },
  async revoke(tokenId) {
    if (client) {
      const key = `refresh:${tokenId}`;
      await client.del(key);
      return true;
    }
    await RefreshTokenModel.updateOne({ token: tokenId }, { revoked: true });
    return true;
  },
  async revokeAllForUser(userId) {
    if (client) {
      // Redis doesn't have easy list of keys per user without bookkeeping; prefer DB for that query
      return false;
    }
    await RefreshTokenModel.updateMany({ userId }, { revoked: true });
    return true;
  },
};
