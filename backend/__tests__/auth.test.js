import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import { redis } from "../lib/redis.js";

beforeAll(async () => {
  const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Cleanup database and connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  await redis.quit();
});

describe("Auth Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: "test_suite@example.com",
    password: "password123",
  };

  describe("POST /api/auth/signup", () => {
    test("Should create a new user and set cookies", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.email).toEqual(testUser.email);

      // Check for cookies in headers
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes("accessToken"))).toBe(true);
      expect(cookies.some((c) => c.includes("refreshToken"))).toBe(true);
    });

    test("Should fail if user already exists", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    test("Should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("name", testUser.name);
      expect(res.body.role).toBe("customer");
    });

    test("Should fail with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    test("Should issue a new access token using a valid refresh token", async () => {
      // 1. First, login to get a fresh refresh token cookie
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookies = loginRes.headers["set-cookie"];
      const refreshTokenCookie = cookies.find((c) =>
        c.startsWith("refreshToken"),
      );

      // 2. Call refresh-token endpoint with that cookie
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", [refreshTokenCookie]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Token refreshed successfully");

      // Ensure a new accessToken cookie was sent back
      const newCookies = res.headers["set-cookie"];
      expect(newCookies.some((c) => c.startsWith("accessToken"))).toBe(true);
    });
  });
});
