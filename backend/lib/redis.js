import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(
  process.env.UPSTASH_REDIS_URL ||
    "rediss://default:AWOqAAIncDJmMWQzMDBiOTZhYzI0OWQ1OTAzNzdmYjVkMDc2YTEwNnAyMjU1MTQ@obliging-gannet-25514.upstash.io:6379"
);

await redis.set("cash", "money");
