const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { productMedia, pushToS3 } = require("../middleware/upload");

// Public: search and list products
router.get("/search", productController.search);
router.get("/", productController.list);
router.get("/:id", productController.get);

// Protected: create product (seller)
router.post(
  "/",
  authMiddleware(["seller"]),
  productMedia,
  pushToS3,
  [
    body("title").notEmpty().withMessage("Title required"),
    body("retailPrice").isNumeric().withMessage("retailPrice must be numeric"),
  ],
  validate,
  productController.create
);

// Update product (owner)
router.put(
  "/:id",
  authMiddleware(["seller"]),
  [
    body("title").optional().notEmpty(),
    body("retailPrice").optional().isNumeric(),
  ],
  validate,
  productController.update
);

// Delete product (owner)
router.delete("/:id", authMiddleware(["seller"]), productController.remove);

module.exports = router;
