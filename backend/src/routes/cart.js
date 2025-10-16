const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const cartController = require("../controllers/cartController");

// All cart routes require authentication (server-side carts belong to user)
router.get("/", authMiddleware(), cartController.getCart);
router.post("/", authMiddleware(), cartController.upsertCart);
router.delete("/:id", authMiddleware(), cartController.removeItem);
// merge guest cart into user cart
router.post("/merge", authMiddleware(), cartController.mergeCart);

module.exports = router;
