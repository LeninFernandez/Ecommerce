const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");
const Product = require("./models/Product");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Coupon = require("./models/Coupon");

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim())
    : "http://localhost:3000",
  credentials: true
}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });

const JWT_SECRET = process.env.JWT_SECRET;

//  MIDDLEWARE 

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Login required" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

async function adminAuth(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

//  EMAIL 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

//  AUTH ROUTES 

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch {
    res.status(400).json({ error: "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid login" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid login" });
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  PRODUCT ROUTES 

app.get("/api/products", async (req, res) => {
  try {
    const { search, category, maxPrice, inStock, sort, page = 1 } = req.query;
    let filter = {};
    if (search) {
      filter.name = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }
    if (category) filter.category = category;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (inStock === "true") filter.inventoryCount = { $gt: 0 };

let query = Product.find(filter);
    if (sort === "price_asc") query = query.sort({ price: 1 });
    else if (sort === "price_desc") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const limit = 100;
    const pageNum = Number(page);
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const products = await query.skip((pageNum - 1) * limit).limit(limit);
    res.json({ products, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/products/:id/reviews", auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  const existing = product.reviews.find(r => r.userId.toString() === req.user.id);
  if (existing) return res.status(400).json({ error: "Already reviewed" });
  const user = await User.findById(req.user.id);
  product.reviews.push({
    userId: user._id,
    userName: user.name,
    rating: req.body.rating,
    comment: req.body.comment
  });
  await product.save();
  res.json(product);
});

//  CART ROUTES 

app.get("/api/cart", auth, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
  res.json(cart);
});

app.post("/api/cart/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId).select("price");
    if (!product) return res.status(404).json({ error: "Product not found" });
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    const item = cart.items.find(i => i.productId == productId);
    if (item) { item.quantity += quantity; item.priceAtAdd = product.price; }
    else { cart.items.push({ productId, quantity, priceAtAdd: product.price }); }
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("cart add error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/cart/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    const item = cart.items.find(i => i.productId == productId);
    if (item) item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("cart update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/cart/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    cart.items = cart.items.filter(i => i.productId != productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("cart remove error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  CHECKOUT & ORDERS 

app.post("/api/verify-promo", auth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(400).json({ error: "Invalid coupon" });
    if (subtotal < coupon.minOrderAmount)
      return res.status(400).json({ error: "Minimum order not met" });
    res.json({ discountPercent: coupon.discountPercent, minOrderAmount: coupon.minOrderAmount });
  } catch (err) {
    console.error("verify-promo error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/checkout", auth, async (req, res) => {
  try {
    const { shippingAddress, cardNumber, couponCode } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: "Cart empty" });

    let subtotal = 0;
    for (const item of cart.items) subtotal += item.productId.price * item.quantity;

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && subtotal >= coupon.minOrderAmount)
        discount = subtotal * (coupon.discountPercent / 100);
    }

    const total = subtotal - discount;
    let paymentStatus = "failed";
    if (cardNumber && cardNumber.length >= 16) paymentStatus = "paid";

    const items = cart.items.map(i => ({
      productId: i.productId._id,
      name: i.productId.name,
      price: i.productId.price,
      quantity: i.quantity,
      image: i.productId.image
    }));

    const order = await Order.create({
      userId: req.user.id, items, subtotal, discount,
      totalAmount: total, couponUsed: couponCode, shippingAddress, paymentStatus
    });

    if (paymentStatus === "paid") {
      for (const item of cart.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId._id, inventoryCount: { $gte: item.quantity } },
          { $inc: { inventoryCount: -item.quantity } }
        );
        if (!updated) {
          return res.status(400).json({
            error: `"${item.productId.name}" is no longer available in the requested quantity.`
          });
        }
      }
      cart.items = [];
      await cart.save();
      const user = await User.findById(req.user.id);
      try {
        await transporter.sendMail({
          to: user.email,
          subject: "Order Receipt",
          text: `Your order total is Rs. ${total}`
        });
      } catch (emailErr) {
        console.error("Email send failed (order still placed):", emailErr.message);
      }
    }
    res.json(order);
  } catch (err) {
    console.error("checkout error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  ADMIN ROUTES 

// Full product list for admin (no pagination, sorted newest first)
app.get("/api/admin/products", auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("admin products error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create product
app.post("/api/admin/products", auth, adminAuth, async (req, res) => {
  try {
    const { name, price, category, image, description, inventoryCount, discount } = req.body;
    if (!name || price == null || !category || inventoryCount == null) {
      return res.status(400).json({ error: "name, price, category, and inventoryCount are required" });
    }
    const product = await Product.create({
      name,
      price: Number(price),
      category,
      image: image || "",
      description: description || "",
      inventoryCount: Number(inventoryCount),
      discount: Number(discount) || 0
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("admin create product error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update any product field (including inventoryCount for quick stock edits)
app.put("/api/admin/products/:id", auth, adminAuth, async (req, res) => {
  try {
    const { name, price, category, image, description, inventoryCount, discount } = req.body;
    const updates = {};
    if (name !== undefined)           updates.name = name;
    if (price !== undefined)          updates.price = Number(price);
    if (category !== undefined)       updates.category = category;
    if (image !== undefined)          updates.image = image;
    if (description !== undefined)    updates.description = description;
    if (inventoryCount !== undefined) updates.inventoryCount = Number(inventoryCount);
    if (discount !== undefined)       updates.discount = Number(discount);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("admin update product error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product
app.delete("/api/admin/products/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("admin delete product error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Analytics: revenue, top products, 7-day trend, low stock alert
app.get("/api/admin/analytics", auth, adminAuth, async (req, res) => {
  try {
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const totalOrders  = revenueAgg[0]?.totalOrders  || 0;
    const totalRevenue = revenueAgg[0]?.totalRevenue  || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          unitsSold: { $sum: "$items.quantity" },
          revenue:   { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrend = await Order.aggregate([
      { $match: { paymentStatus: "paid", date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          orders:  { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const lowStock = await Product.find({ inventoryCount: { $lt: 5 } })
      .select("name inventoryCount category")
      .sort({ inventoryCount: 1 });

    res.json({ totalOrders, totalRevenue, avgOrderValue, topProducts, recentTrend, lowStock });
  } catch (err) {
    console.error("admin analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// All orders (admin view), most recent 50, with customer name/email
app.get("/api/admin/orders", auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ date: -1 })
      .limit(50)
      .populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    console.error("admin orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// All products with reviews (only products that have at least one review)
app.get("/api/admin/reviews", auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find({ "reviews.0": { $exists: true } })
      .select("name image category reviews")
      .sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error("admin reviews error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  START 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));