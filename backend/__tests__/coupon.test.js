import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import { redis } from "../lib/redis.js";

describe("Coupon Endpoints", () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
    await mongoose.connect(uri);

    const email = `coupon_user_${Date.now()}@test.com`;
    const user = await User.create({
      name: "Coupon Tester",
      email,
      password: "password123",
    });
    userId = user._id;

    // 1. Create an active valid coupon
    await Coupon.create({
      code: "SAVE10",
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
      isActive: true,
      userId: userId,
    });

    // 2. Create an expired coupon
    await Coupon.create({
      code: "EXPIRED20",
      discountPercentage: 20,
      expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
      isActive: true,
      userId: userId,
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

  test("GET /api/coupons - Should fetch active coupon for user", async () => {
    const res = await request(app)
      .get("/api/coupons")
      .set("Cookie", [userToken]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.code).toBe("SAVE10");
  });

  test("POST /api/coupons/validate - Should validate a correct coupon", async () => {
    const res = await request(app)
      .post("/api/coupons/validate")
      .set("Cookie", [userToken])
      .send({ code: "SAVE10" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Coupon is valid");
    expect(res.body.discountPercentage).toBe(10);
  });

  test("POST /api/coupons/validate - Should handle expired coupons", async () => {
    const res = await request(app)
      .post("/api/coupons/validate")
      .set("Cookie", [userToken])
      .send({ code: "EXPIRED20" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Coupon expired");

    // Verify it was actually deactivated in the DB
    const coupon = await Coupon.findOne({ code: "EXPIRED20" });
    expect(coupon.isActive).toBe(false);
  });

  test("POST /api/coupons/validate - Should return 404 for missing coupon", async () => {
    const res = await request(app)
      .post("/api/coupons/validate")
      .set("Cookie", [userToken])
      .send({ code: "NONEXISTENT" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Coupon not found");
  });
});
