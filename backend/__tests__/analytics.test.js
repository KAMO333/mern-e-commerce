import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import { redis } from "../lib/redis.js";

describe("Analytics Endpoints", () => {
  let adminToken;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
    await mongoose.connect(uri);

    // 1. Setup Admin (6+ char password)
    const adminEmail = `admin_analytics_${Date.now()}@test.com`;
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: "password123",
      role: "admin",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: "password123",
    });
    adminToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("accessToken"),
    );

    // 2. Seed data with valid passwords
    await User.create({
      name: "Test User",
      email: `user_${Date.now()}@test.com`,
      password: "password123",
    });

    // 3. Seed orders across two different days to test getDailySalesData
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Order.create([
      {
        user: new mongoose.Types.ObjectId(),
        products: [],
        totalAmount: 150,
        stripeSessionId: "session_1",
        createdAt: today,
      },
      {
        user: new mongoose.Types.ObjectId(),
        products: [],
        totalAmount: 50,
        stripeSessionId: "session_2",
        createdAt: yesterday,
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  test("GET /api/analytics - Should fetch combined dashboard data (Admin only)", async () => {
    const res = await request(app)
      .get("/api/analytics")
      .set("Cookie", [adminToken]);

    expect(res.statusCode).toEqual(200);

    // Check analyticsData (General Totals)
    expect(res.body.analyticsData.users).toBeGreaterThanOrEqual(2);
    expect(res.body.analyticsData.totalRevenue).toBe(200);

    // Check dailySalesData (Array Filling)
    expect(Array.isArray(res.body.dailySalesData)).toBe(true);
    expect(res.body.dailySalesData.length).toBe(8); // Current day + 7 past days

    // Verify at least one day has data
    const activeDays = res.body.dailySalesData.filter((d) => d.sales > 0);
    expect(activeDays.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/analytics - Should fail for non-admin users", async () => {
    // Create a regular customer
    const customerEmail = `customer_${Date.now()}@test.com`;
    await User.create({
      name: "Customer",
      email: customerEmail,
      password: "password123",
      role: "customer",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: customerEmail,
      password: "password123",
    });
    const customerToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("accessToken"),
    );

    const res = await request(app)
      .get("/api/analytics")
      .set("Cookie", [customerToken]);

    expect(res.statusCode).toEqual(403); // Forbidden
  });
});
