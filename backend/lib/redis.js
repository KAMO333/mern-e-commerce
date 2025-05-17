import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(
  process.env.UPSTASH_REDIS_URL ||
    "rediss://default:AYGeAAIjcDFhNWY1NmUxMzRkMTM0N2NiOTMxNTgwZmRiNGQ3MDNjOHAxMA@knowing-wallaby-33182.upstash.io:6379"
);

await redis.set("cash", "money");
