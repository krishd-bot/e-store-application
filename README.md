# Aurelia — Full-Stack E-Commerce Platform

A complete MERN e-commerce application: customer storefront + admin dashboard, Razorpay payments, Cloudinary image hosting, transactional email, and order/delivery tracking.

**Stack:** React (Vite) + Tailwind CSS · Node.js/Express · MongoDB (Mongoose) · JWT auth · Razorpay · Cloudinary · Nodemailer

---

## What's included

**Customer side**
- Home, About, Products (with filtering: category, price range, brand, size, color, rating, search, sort, pagination), Product detail with reviews
- Register / Login / Logout / Forgot & reset password (JWT stored in an httpOnly cookie)
- Cart (persisted in localStorage) → Checkout → Razorpay payment or Cash on Delivery
- Order confirmation email, order history, order cancellation, saved addresses, wishlist API

**Admin side** (role-protected)
- Dashboard with revenue, order counts, status breakdown
- Products: create / edit / delete, multi-image upload to Cloudinary, stock, pricing, sizes/colors/tags, featured flag
- Categories: create / delete with image
- Orders: view all, filter by status, update delivery status (Pending → Processing → Shipped → Out for Delivery → Delivered / Cancelled) — each update emails the customer
- Users: view, deactivate/reactivate, delete

---

## Project structure

```
ecommerce-app/
├── backend/          Express API
│   ├── config/        db, cloudinary, razorpay, nodemailer
│   ├── controllers/    business logic
│   ├── middleware/     auth, admin guard, multer upload, error handler
│   ├── models/         User, Product, Category, Order
│   ├── routes/
│   ├── utils/           token, email templates, slugify, seedAdmin
│   └── server.js
└── frontend/         Vite + React storefront & admin UI
    └── src/
        ├── api/          axios instance
        ├── context/      Auth + Cart context
        ├── components/   Navbar, Footer, ProductCard, guards, etc.
        └── pages/        Home, Products, Cart, Checkout, admin/...
```

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB database (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine)
- A [Razorpay](https://razorpay.com) account (use **Test Mode** keys while developing)
- An email account for sending mail (Gmail with an [App Password](https://myaccount.google.com/apppasswords) is the easiest option)

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in every value:

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Atlas → Connect → Drivers, or your local connection string |
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Cloudinary Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_ID/KEY_SECRET` | Razorpay Dashboard → Settings → API Keys (use Test keys first) |
| `EMAIL_HOST/PORT/USER/PASS/FROM` | Your SMTP provider. For Gmail: host `smtp.gmail.com`, port `465`, and a 16-character **App Password** (not your normal password) |
| `ADMIN_NAME/EMAIL/PASSWORD` | Credentials for the admin account created by the seed script |

Create the first admin user:

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # nodemon, auto-restarts
# or
npm start
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

---

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:5000`, so no extra configuration is needed locally.

Sign in with the admin credentials you set in the backend `.env`, then visit `/admin` to add categories and products.

---

## 4. Typical first run

1. Start MongoDB (or confirm your Atlas cluster is reachable).
2. `cd backend && npm run seed` — creates your admin account.
3. `cd backend && npm run dev` — starts the API on port 5000.
4. `cd frontend && npm run dev` — starts the storefront on port 5173.
5. Go to `/admin/categories` and add at least one category.
6. Go to `/admin/products/new` and add a product with images — mark it "Featured" so it shows on the homepage.
7. Browse the storefront, add the product to your cart, and check out with Razorpay **test card** `4111 1111 1111 1111`, any future expiry, any CVV, and any OTP (Razorpay's test mode auto-approves).

---

## 5. Razorpay test mode

While `RAZORPAY_KEY_ID` starts with `rzp_test_`, no real money moves. Common test instruments:
- **Card:** 4111 1111 1111 1111, any future expiry/CVV
- **UPI:** `success@razorpay` (always succeeds) or `failure@razorpay` (always fails)

Switch to live keys only when you're ready to accept real payments, and make sure your domain is verified in the Razorpay dashboard.

---

## 6. Deployment notes

- **Backend:** deploy to Render, Railway, or a VPS. Set all `.env` variables in the host's environment settings. Set `NODE_ENV=production` and `CLIENT_URL` to your deployed frontend URL (needed for CORS and cookie settings).
- **Frontend:** deploy to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL (e.g. `https://api.yourapp.com/api`) as a build-time env variable.
- Because auth uses an httpOnly cookie, backend and frontend should be on the same top-level domain (or you'll need `sameSite: "none"` + HTTPS on both, which is already configured for `NODE_ENV=production`).

---

## 7. Notes & things you may want to extend

- Delivery tracking here is a status field with a timestamped history array (`Order.trackingHistory`) — good enough for most stores; wire it up to a courier API (Shiprocket, Delhivery, etc.) if you need real-time carrier tracking.
- Wishlist and address APIs are built on the backend; the frontend currently surfaces addresses in the Profile page — wishlist UI can be added the same way using `GET/POST /api/users/wishlist`.
- Product search uses MongoDB's text index (`name`, `description`, `brand`, `tags`) — good for a single store; swap in Algolia/Meilisearch if you need typo-tolerant search at scale.
- Passwords are hashed with bcrypt; JWTs live in httpOnly cookies (not localStorage) to reduce XSS risk.
