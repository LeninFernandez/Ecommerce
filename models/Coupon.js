const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  discountPercent: Number,
  minOrderAmount: Number,
  isActive: Boolean
});

module.exports = mongoose.model("Coupon", CouponSchema);