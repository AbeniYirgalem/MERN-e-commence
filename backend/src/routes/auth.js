const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const rateLimit = require("express-rate-limit");

// basic rate limiter for auth endpoints (tune in prod)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

// Register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password min 8 chars"),
  ],
  validate,
  authController.register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  authController.login
);

// Refresh tokens (using httpOnly cookie)
const authTokens = require("../controllers/authTokens");
router.post("/refresh", authTokens.refreshTokenHandler);

// Logout (clear cookie)
router.post("/logout", authController.logoutClear);

// Return authenticated user based on httpOnly cookie
router.get("/me", authController.me);

// Email verification (link)
router.get("/verify", authController.verify);

// Forgot password
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email required")],
  validate,
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("token required"),
    body("password").isLength({ min: 8 }).withMessage("Password min 8 chars"),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
