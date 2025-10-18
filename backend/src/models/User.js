const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin", "support"],
      default: "buyer",
    },
    locale: { type: String, default: "en" },
    mfaEnabled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
