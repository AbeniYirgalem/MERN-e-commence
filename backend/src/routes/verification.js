const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");
const { authMiddleware } = require("../middleware/auth");

const { verificationDocs, pushToS3 } = require("../middleware/upload");

// Create verification case (seller uploads docs)
router.post(
  "/",
  authMiddleware(["seller"]),
  verificationDocs,
  pushToS3,
  verificationController.createCase
);

// Get case by id (admin/seller)
router.get(
  "/:id",
  authMiddleware(["seller", "admin"]),
  verificationController.getCase
);

// Admin: approve / reject
router.post(
  "/:id/approve",
  authMiddleware(["admin"]),
  verificationController.approveCase
);
router.post(
  "/:id/reject",
  authMiddleware(["admin"]),
  verificationController.rejectCase
);

module.exports = router;
