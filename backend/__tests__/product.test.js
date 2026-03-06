import { jest } from "@jest/globals";
import request from "supertest";

// 1. MOCK BEFORE ANY OTHER IMPORTS
// This intercepts the import of the cloudinary file before the controller loads it
jest.unstable_mockModule("../lib/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn(async () => ({
        secure_url: "https://res.cloudinary.com/test.png",
      })),
      destroy: jest.fn(async () => ({ result: "ok" })),
    },
  },
}));

// 2. NOW IMPORT THE REST
// We use dynamic imports for app and others so they pick up the mock above
const { default: app } = await import("../server.js");
const { default: User } = await import("../models/user.model.js");
const { default: mongoose } = await import("mongoose");
const { redis } = await import("../lib/redis.js");

describe("Product Endpoints", () => {
  let adminToken;
  let productId;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
    await mongoose.connect(uri);

    const email = `admin_${Date.now()}@test.com`;
    await User.create({
      name: "Admin User",
      email,
      password: "password123",
      role: "admin",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password: "password123",
    });

    adminToken = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("accessToken"),
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  test("POST /api/products - Should create a product (Admin only)", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", [adminToken])
      .send({
        name: "Test Sneakers",
        description: "Comfortable running shoes",
        price: 99.99,
        category: "shoes",
        image: "data:image/png;base64,mockdata",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    productId = res.body._id;
  });

  test("GET /api/products - Should fetch all products (Admin only)", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Cookie", [adminToken]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test("PATCH /api/products/:id - Should toggle featured status", async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .set("Cookie", [adminToken]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.isFeatured).toBe(true);
  });

  test("DELETE /api/products/:id - Should delete a product", async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Cookie", [adminToken]);

    expect(res.statusCode).toEqual(200);
  });
});
