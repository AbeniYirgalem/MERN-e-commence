const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: { type: String, required: true },
    description: { type: String },
    attributes: { type: Object, default: {} },
    media: [{ url: String, type: String }],
    retailPrice: { type: Number, required: true },
    wholesaleTiers: [{ minQty: Number, price: Number }],
    stock: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
