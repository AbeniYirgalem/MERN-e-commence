const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

// Create order (checkout)
router.post(
  "/",
  authMiddleware(["buyer", "seller"]),
  [body("items").isArray({ min: 1 }).withMessage("Items required")],
  validate,
  orderController.create
);

// Get order
router.get(
  "/:id",
  authMiddleware(["buyer", "seller", "admin"]),
  orderController.get
);

// List orders for current user (buyer/seller) or all for admin
router.get(
  "/",
  authMiddleware(["buyer", "seller", "admin"]),
  orderController.list
);

// Admin: update order status
router.patch(
  "/:id/status",
  authMiddleware(["admin"]),
  [body("status").notEmpty().withMessage("status required")],
  validate,
  orderController.updateStatus
);

module.exports = router;
