import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(
  process.env.UPSTASH_REDIS_URL ||
    "rediss://default:AXOfAAIjcDExZjBkNWU1OGY5N2Q0OTM3YTBhODIwNjQzZTFhYTBkYXAxMA@exotic-pheasant-29599.upstash.io:6379"
);
await redis.set("cash", "money");
