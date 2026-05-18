# CommerceHub 🛒

A full-stack e-commerce web application with a companion React Native mobile app. Built with Node.js, Express, MongoDB Atlas, and vanilla HTML/CSS/JS on the web, and Expo (React Native + TypeScript) on mobile.

**Live Demo:** [Deployed on Render](https://drive.google.com/file/d/1i_3TszJhi9XnUJBFMOD41dPD9aeC0mfR/view?usp=sharing)

---

## Features

**Customer**
- Browse 47+ products across 5 categories (Electronics, Clothing, Accessories, Home, Fitness)
- Search, filter by category, price range, and in-stock status
- Product detail pages with reviews and star ratings
- Persistent cart (add, update quantity, remove)
- Checkout with shipping address and card number
- Order history

**Admin**
- Full product CRUD (add, edit, delete, live stock editing)
- Analytics dashboard (total revenue, top 5 products by units sold, 7-day summary, low stock alerts)
- Order management with status updates
- Review moderation

**Auth**
- JWT-based authentication (7-day tokens)
- bcrypt password hashing
- Role-based access control (customer / admin)
- Protected routes via middleware

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | HTML5, CSS3, Vanilla JavaScript |
| Mobile App | React Native, Expo, TypeScript, Expo Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT (jsonwebtoken), bcrypt |
| Deployment | Render |

---

## Project Structure

```
├── server.js              # Express server & all API routes
├── createAdmin.js         # Script to seed admin user
├── seedProducts.js        # Script to seed 47 sample products
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Order.js
│   └── Coupon.js
├── public/                # Web frontend (served statically)
│   ├── index.html
│   ├── shop.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── order-placed.html
│   ├── auth.html
│   ├── admin.html
│   ├── script.js
│   └── style.css
└── CommerceHub/           # React Native mobile app (Expo)
    ├── app/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── components/
    └── constants/
        └── theme.ts
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Expo CLI (for mobile app)

### 1. Clone the repo

```bash
git clone https://github.com/LeninFernandez/commercehub.git
cd commercehub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ORIGIN=http://localhost:3000
PORT=3000
```

### 4. Seed the database

```bash
# Create admin user (email: admin@admin.com / password: admin123)
node createAdmin.js

# Seed 47 sample products
node seedProducts.js
```

### 5. Start the server

```bash
npm start
```

Open `http://localhost:3000` in your browser.

---

### Running the Mobile App

```bash
cd CommerceHub
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

> Make sure your backend server is running and update the API base URL in the mobile app to point to your server's IP/hostname.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Register a new user |
| POST | `/api/login` | Login and receive JWT |
| GET | `/api/me` | Get current user info |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, sort) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products/:id/reviews` | Submit a review (auth required) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PATCH | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout` | Place an order |
| GET | `/api/orders` | Get order history |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/analytics` | Sales analytics |
| GET | `/api/admin/reviews` | All product reviews |

---

## Screenshots

| Page | Preview |
|------|---------|
| Home | Landing page with navigation |
| Shop | Product grid with filters and search |
| Product Detail | Image, price, stock, reviews |
| Cart | Items, quantity controls, total |
| Checkout | Shipping address and payment |
| Order History | Past orders with status |
| Admin – Products | CRUD with live stock editing |
| Admin – Analytics | Revenue, top products, low stock alerts |

---

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated |
| `PORT` | Server port (default: 3000) |

---

## License

MIT
