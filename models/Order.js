const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  subtotal: Number,
  discount: Number,
  totalAmount: Number,
  couponUsed: String,
  shippingAddress: String,
  paymentStatus: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);