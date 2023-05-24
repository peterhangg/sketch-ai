import { Redis } from "@upstash/redis";
import { config } from "../../config";

export const redis =
  config.upstash.redis.url && config.upstash.redis.token
    ? new Redis(config.upstash.redis)
    : undefined;
