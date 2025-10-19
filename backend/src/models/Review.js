const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    orderItemId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, min: 1, max: 5 },
    text: String,
    media: [{ url: String, type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
