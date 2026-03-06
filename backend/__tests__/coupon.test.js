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

    const email = `coupon_final_${Date.now()}@test.com`;
    const user = await User.create({
      name: "Coupon Tester",
      email,
      password: "password123",
    });
    userId = user._id;

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password: "password123",
    });
    userToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("accessToken"),
    );
  });

  // Clean slate before EVERY single test in this file
  beforeEach(async () => {
    await Coupon.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  test("GET /api/coupons - Should fetch active coupon", async () => {
    await Coupon.create({
      code: "GET_TEST",
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 86400000),
      isActive: true,
      userId: userId,
    });

    const res = await request(app)
      .get("/api/coupons")
      .set("Cookie", [userToken]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.code).toBe("GET_TEST");
  });

  test("POST /api/coupons/validate - Should validate SAVE10", async () => {
    await Coupon.create({
      code: "SAVE10",
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 86400000),
      isActive: true,
      userId: userId,
    });

    const res = await request(app)
      .post("/api/coupons/validate")
      .set("Cookie", [userToken])
      .send({ code: "SAVE10" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.discountPercentage).toBe(10);
  });

  test("POST /api/coupons/validate - Should handle expired code", async () => {
    await Coupon.create({
      code: "EXPIRED_CODE",
      discountPercentage: 20,
      expirationDate: new Date(Date.now() - 86400000), // Yesterday
      isActive: true,
      userId: userId,
    });

    const res = await request(app)
      .post("/api/coupons/validate")
      .set("Cookie", [userToken])
      .send({ code: "EXPIRED_CODE" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Coupon expired");
  });
});
