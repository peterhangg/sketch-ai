import type { NextApiRequest, NextApiResponse } from "next";
import Ratelimiter from "@/lib/rate-limit";

const ratelimiter = new Ratelimiter();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { success, message } = await ratelimiter.validate(req, res);
  if (!success) {
    return res.status(429).json({ message });
  }

  return res.status(200).json({ message });
}
