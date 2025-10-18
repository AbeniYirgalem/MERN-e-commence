const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: { type: String },
    country: { type: String },
    docs: [{ filename: String, url: String, uploadedAt: Date }],
    badgeTier: {
      type: String,
      enum: ["none", "bronze", "silver", "gold", "platinum"],
      default: "none",
    },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);
