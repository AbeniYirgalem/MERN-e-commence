const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: Number,
        price: Number,
      },
    ],
    totals: {
      subtotal: Number,
      shipping: Number,
      taxes: Number,
      total: Number,
    },
    shipping: { address: Object, method: String },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "returned",
      ],
      default: "pending",
    },
    tracking: { carrier: String, trackingNumber: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
