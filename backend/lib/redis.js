import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// export const redis = new Redis(
//   process.env.UPSTASH_REDIS_URL ||
//     "rediss://default:AXOfAAIjcDExZjBkNWU1OGY5N2Q0OTM3YTBhODIwNjQzZTFhYTBkYXAxMA@exotic-pheasant-29599.upstash.io:6379"
// );

// await redis.set("cash", "money");

export const client = new Redis(
  "rediss://default:AYGeAAIjcDFhNWY1NmUxMzRkMTM0N2NiOTMxNTgwZmRiNGQ3MDNjOHAxMA@knowing-wallaby-33182.upstash.io:6379"
);
await client.set("foo", "bar");
