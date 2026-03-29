// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: "admin@admin.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({ name: "Admin", email: "admin@admin.com", password: hashed, role: "admin" });
  console.log("Admin created! Email: admin@admin.com | Password: admin123");
  mongoose.connection.close();
}

createAdmin().catch(console.error);