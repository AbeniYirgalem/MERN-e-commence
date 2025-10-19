const mongoose = require("mongoose");

const premiumSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tier: { type: String },
    start: Date,
    end: Date,
    benefits: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PremiumSubscription", premiumSchema);
