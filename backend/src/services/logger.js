const pino = require("pino");
const Sentry = require("@sentry/node");

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    logger.info("Sentry initialized");
  }
}

module.exports = { logger, initSentry, Sentry };
