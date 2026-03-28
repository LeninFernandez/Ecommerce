const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      priceAtAdd: Number
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cart", CartSchema);