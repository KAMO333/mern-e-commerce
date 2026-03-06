# E-Commerce Store 🛒

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

[![CI Pipeline](https://github.com/KAMO333/mern-e-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/KAMO333/mern-e-commerce/actions/workflows/ci.yml)

A full-stack, high-performance E-Commerce platform built with the MERN stack, featuring real-time caching, secure payments, and a professional automated testing suite.

---

## 🌟 Key Features

### 🔐 Security & Auth

- **JWT Authentication:** Secure login using Access and Refresh tokens stored in HTTP-only cookies.
- **Role-Based Access:** Specialized middleware for User and Admin protected routes.
- **Data Protection:** Password hashing with bcrypt and secure API endpoints.

### 🛍️ Shopping Experience

- **Catalog:** Product management with category filtering.
- **Real-time Cart:** Persistent shopping cart saved to the database.
- **Stripe Integration:** Professional checkout flow with secure payment processing.
- **Coupon System:** Dynamic discount codes with automatic expiration logic.

### 👑 Admin & Performance

- **Admin Dashboard:** Manage products and view store performance.
- **Sales Analytics:** Data-driven insights using MongoDB Aggregation pipelines.
- **Redis Caching:** Ultra-fast performance for featured products using Redis.
- **Cloudinary:** Robust image hosting and management.

### 🧪 Quality Assurance

- **Integration Testing:** 21+ automated tests covering the entire backend.
- **70%+ Code Coverage:** Verified logic for Auth, Payments, Cart, and Coupons.
- **Dockerized Test Environment:** Consistent testing using Docker Compose.

---

## 🛠️ Local Setup

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for API keys)
- Cloudinary account (for image uploads)
- Upstash Redis (or local Redis)

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongo_uri

UPSTASH_REDIS_URL=your_redis_url

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Installation

```bash
# Install dependencies for both backend and frontend
npm install
cd frontend && npm install
cd ..
```

### 3. Running the App

```bash
# Run both frontend and backend in development mode
npm run dev
```

---

## 🧪 Testing & Coverage

Run the full test suite using Docker for a clean, isolated environment:

```bash
# Run all tests and check coverage
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

---

## 🚀 Deployment

```bash
# Build the project for production
npm run build

# Start the production server
npm start
```
