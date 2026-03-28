
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI);

const products = [

  // ELECTRONICS
  { name: "Smartphone", price: 25000, category: "electronics", image: "/images/smartphone.jpg", inventoryCount: 10 },
  { name: "Gaming Laptop", price: 55000, category: "electronics", image: "/images/gaminglaptop.jpg", inventoryCount: 5 },
  { name: "Smartwatch", price: 6000, category: "electronics", image: "/images/smartwatch.jpg", inventoryCount: 8 },
  { name: "Television", price: 40000, category: "electronics", image: "/images/tv.jpg", inventoryCount: 4 },
  { name: "VR Headset", price: 12000, category: "electronics", image: "/images/vr.jpg", inventoryCount: 6 },
  { name: "Earbuds", price: 1500, category: "electronics", image: "/images/earbuds.jpg", inventoryCount: 15 },
  { name: "Camera", price: 30000, category: "electronics", image: "/images/camera.jpg", inventoryCount: 5 },
  { name: "Gaming Console", price: 45000, category: "electronics", image: "/images/console.jpg", inventoryCount: 3 },
  { name: "Hard Drive", price: 5000, category: "electronics", image: "/images/harddrive.jpg", inventoryCount: 10 },
  { name: "Speaker", price: 3000, category: "electronics", image: "/images/speaker.jpg", inventoryCount: 12 },
  { name: "Tablet", price: 20000, category: "electronics", image: "/images/tablet.jpg", inventoryCount: 7 },

  // CLOTHING
  { name: "Cotton Shirt", price: 500, category: "clothing", image: "/images/cottonshirt.jpg", inventoryCount: 20 },
  { name: "Formal Shirt", price: 800, category: "clothing", image: "/images/formalshirt.jpg", inventoryCount: 15 },
  { name: "T-Shirt", price: 400, category: "clothing", image: "/images/tshirt.jpg", inventoryCount: 25 },
  { name: "Hoodie", price: 1200, category: "clothing", image: "/images/hoodie.jpg", inventoryCount: 10 },
  { name: "Jacket", price: 2000, category: "clothing", image: "/images/jacket.jpg", inventoryCount: 6 },
  { name: "Jeans", price: 1200, category: "clothing", image: "/images/jean.jpg", inventoryCount: 18 },
  { name: "Shorts", price: 600, category: "clothing", image: "/images/short.jpg", inventoryCount: 22 },
  { name: "Frock", price: 1500, category: "clothing", image: "/images/frock.jpg", inventoryCount: 8 },
  { name: "Socks", price: 200, category: "clothing", image: "/images/socks.jpg", inventoryCount: 30 },

  // ACCESSORIES
  { name: "Backpack", price: 1500, category: "accessories", image: "/images/backpack.jpg", inventoryCount: 12 },
  { name: "Belt", price: 700, category: "accessories", image: "/images/belt.jpg", inventoryCount: 20 },
  { name: "Wallet", price: 1200, category: "accessories", image: "/images/wallet.jpg", inventoryCount: 10 },
  { name: "Sunglasses", price: 2500, category: "accessories", image: "/images/sunglasses.jpg", inventoryCount: 9 },
  { name: "Scarf", price: 500, category: "accessories", image: "/images/scarf.jpg", inventoryCount: 14 },
  { name: "Wristwatch", price: 4500, category: "accessories", image: "/images/wristwatch.jpg", inventoryCount: 7 },
  { name: "Earrings", price: 800, category: "accessories", image: "/images/earrings.jpg", inventoryCount: 16 },
  { name: "Cap", price: 400, category: "accessories", image: "/images/cap.jpg", inventoryCount: 25 },

  // HOME
  { name: "Air Conditioner", price: 30000, category: "home", image: "/images/ac.jpg", inventoryCount: 3 },
  { name: "Air Purifier", price: 8000, category: "home", image: "/images/airpurifier.jpg", inventoryCount: 6 },
  { name: "Blender", price: 2500, category: "home", image: "/images/blender.jpg", inventoryCount: 10 },
  { name: "Coffee Maker", price: 3500, category: "home", image: "/images/coffeemaker.jpg", inventoryCount: 5 },
  { name: "Kettle", price: 1200, category: "home", image: "/images/kettle.jpg", inventoryCount: 12 },
  { name: "Microwave", price: 8000, category: "home", image: "/images/microwave.jpg", inventoryCount: 4 },
  { name: "Toaster", price: 1500, category: "home", image: "/images/toaster.jpg", inventoryCount: 8 },
  { name: "Vacuum Cleaner", price: 10000, category: "home", image: "/images/vacuum.jpg", inventoryCount: 3 },
  { name: "Dining Set", price: 12000, category: "home", image: "/images/diningset.jpg", inventoryCount: 2 },

  // FITNESS
  { name: "Dumbbells", price: 3000, category: "fitness", image: "/images/dumbbells.jpg", inventoryCount: 10 },
  { name: "Yoga Mat", price: 1500, category: "fitness", image: "/images/yogamat.jpg", inventoryCount: 15 },
  { name: "Football", price: 1200, category: "fitness", image: "/images/football.jpg", inventoryCount: 20 },
  { name: "Tennis Racket", price: 2500, category: "fitness", image: "/images/tennisracket.jpg", inventoryCount: 7 },
  { name: "Helmet", price: 1000, category: "fitness", image: "/images/helmet.jpg", inventoryCount: 18 },
  { name: "Hiking Bag", price: 2500, category: "fitness", image: "/images/hikingbag.jpg", inventoryCount: 9 },
  { name: "Sneakers", price: 3000, category: "fitness", image: "/images/sneakers.jpg", inventoryCount: 11 }

];

async function seed() {
  try {
    await Product.deleteMany({});
    console.log("Old products deleted");

    await Product.insertMany(products);
    console.log("New products inserted");

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

seed();