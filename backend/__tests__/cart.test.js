import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

describe("Cart Endpoints", () => {
  let userToken;
  let productId;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://test-db:27017/test-db";
    await mongoose.connect(uri);

    // 1. Setup User with unique email
    const email = `cart_user_${Date.now()}@test.com`;
    await User.create({
      name: "Cart User",
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

    // 2. Setup Product
    const product = await Product.create({
      name: "Cart Test Item",
      description: "Testing cart logic",
      price: 10.0,
      category: "test",
      image: "http://test.com/img.png",
    });
    productId = product._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  test("POST /api/cart - Should add a product to cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Cookie", [userToken])
      .send({ productId });

    expect(res.statusCode).toEqual(200);
    // Convert all items to strings to ensure the comparison works
    const itemIds = res.body.map((item) =>
      (typeof item === "object" ? item._id || item.productId : item).toString(),
    );
    expect(itemIds).toContain(productId);
  });

  test("GET /api/cart - Should fetch all products in cart", async () => {
    const res = await request(app).get("/api/cart").set("Cookie", [userToken]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("name", "Cart Test Item");
  });

  test("PUT /api/cart/:id - Should update product quantity", async () => {
    const res = await request(app)
      .put(`/api/cart/${productId}`)
      .set("Cookie", [userToken])
      .send({ quantity: 5 });

    expect(res.statusCode).toEqual(200);
    // Your controller returns user.cartItems, let's verify it's an array
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("DELETE /api/cart - Should remove a specific product from cart", async () => {
    const res = await request(app)
      .delete("/api/cart")
      .set("Cookie", [userToken])
      .send({ productId });

    expect(res.statusCode).toEqual(200);
    const itemIds = res.body.map((item) => (item._id || item).toString());
    expect(itemIds).not.toContain(productId);
  });

  test("DELETE /api/cart - Should clear the entire cart if no productId sent", async () => {
    // Add one back
    await request(app)
      .post("/api/cart")
      .set("Cookie", [userToken])
      .send({ productId });

    const res = await request(app)
      .delete("/api/cart")
      .set("Cookie", [userToken])
      .send({});

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });
});
