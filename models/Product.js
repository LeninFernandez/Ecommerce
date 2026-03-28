const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: String,
  
  price: { type: Number, min: 0 },
  category: String,
  image: String,
  description: String,
  
  inventoryCount: { type: Number, min: 0 },
  discount: Number,
  reviews: [ReviewSchema],
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: "text" });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

module.exports = mongoose.model("Product", ProductSchema);
