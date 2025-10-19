const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    docs: [{ filename: String, url: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationCase", verificationSchema);
