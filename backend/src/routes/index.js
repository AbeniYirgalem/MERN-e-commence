const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const productRoutes = require("./products");
const orderRoutes = require("./orders");
const verificationRoutes = require("./verification");
const cartRoutes = require("./cart");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/verification", verificationRoutes);
router.use("/cart", cartRoutes);

// Root - provide documented endpoints and metadata
router.get("/", (req, res) =>
  res.json({
    name: "OneAfrica Trade API",
    version: "0.1.0",
    docs: {
      health: "/health",
      auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        otp: "/api/auth/otp",
      },
      products: "/api/products",
      orders: "/api/orders",
      verification: "/api/verification",
    },
    note: "See README.md for local setup. This list is illustrative and not exhaustive.",
  })
);
module.exports = router;
