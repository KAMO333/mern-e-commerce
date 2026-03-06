import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import { redis } from "../lib/redis.js";

beforeAll(async () => {
  // Docker uses the service name 'test-db' as the hostname
  const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await redis.quit();
});

describe("Auth Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: "test_docker@example.com",
    password: "password123",
  };

  test("POST /api/auth/signup - Should create a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.email).toEqual(testUser.email);
  });
});
