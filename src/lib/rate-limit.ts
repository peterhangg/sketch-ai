import type { NextApiRequest, NextApiResponse } from "next";
import { Ratelimit } from "@upstash/ratelimit";
import requestIp from "request-ip";
import { redis } from "./redis";
import { formatTime } from "./utils";

const REQUEST_LIMIT = 12;
const LIMIT_DURATION = "1h";

interface ValidateResponse {
  success: boolean;
  message: string;
}

class Ratelimiter {
  private ratelimit: Ratelimit | undefined;

  constructor() {
    if (redis) {
      this.ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.fixedWindow(REQUEST_LIMIT, LIMIT_DURATION),
      });
    }
  }

  public async validate(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<ValidateResponse> {
    if (!this.ratelimit) {
      return {
        success: false,
        message: "Something went wrong on rate limiter",
      };
    }

    const identifier = requestIp.getClientIp(req) ?? "127.0.0.1";
    const result = await this.ratelimit.limit(identifier);

    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);

    if (!result.success) {
      const now = Date.now();
      const resetTimer = Math.floor((result.reset - now) / 1000);
      const { minutes, seconds } = formatTime(resetTimer);

      return {
        success: false,
        message: `Request limit exceeded. Try again in ${minutes} mins and ${seconds}s.`,
      };
    }

    return {
      success: true,
      message: "Request limit validated",
    };
  }
}

export default Ratelimiter;
