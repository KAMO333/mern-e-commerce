import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

const mockUserId = new mongoose.Types.ObjectId().toString();

// 1. MOCK STRIPE
jest.unstable_mockModule("../lib/stripe.js", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: "session_123" }),
        retrieve: jest.fn().mockResolvedValue({
          payment_status: "paid",
          amount_total: 10000,
          metadata: {
            userId: mockUserId, // Use valid ObjectId string
            couponCode: "SAVE10",
            products: JSON.stringify([
              {
                id: new mongoose.Types.ObjectId().toString(),
                quantity: 2,
                price: 50,
              },
            ]),
          },
        }),
      },
    },
    coupons: {
      create: jest.fn().mockResolvedValue({ id: "stripe_coupon_123" }),
    },
  },
}));

const { default: app } = await import("../server.js");
const { default: User } = await import("../models/user.model.js");
const { redis } = await import("../lib/redis.js");

describe("Payment Endpoints", () => {
  let userToken;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
    await mongoose.connect(uri);

    const email = `pay_user_${Date.now()}@test.com`;
    await User.create({
      _id: mockUserId, // Match the mock metadata
      name: "Buyer",
      email,
      password: "password123",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password: "password123",
    });
    userToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("accessToken"),
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  test("POST /api/payments/create-checkout-session - Should initiate Stripe session", async () => {
    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Cookie", [userToken])
      .send({
        products: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            name: "Laptop",
            price: 1000,
            quantity: 1,
            image: "img.png",
          },
        ],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", "session_123");
  });

  test("POST /api/payments/checkout-success - Should create order", async () => {
    const res = await request(app)
      .post("/api/payments/checkout-success")
      .set("Cookie", [userToken])
      .send({ sessionId: "unique_session_" + Date.now() });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
