import { NextApiRequest, NextApiResponse } from "next";
import { getServerErrorFromUnknown } from "./getServerErrorFromUnknown";

type NextApiHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<T>;

export function DefaultNextApiHandler<T>(fn: NextApiHandler<T>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const result = await fn(req, res);
      if (result) return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      const error = getServerErrorFromUnknown(err);
      return res.status(error.statusCode).json({ message: error.message });
    }
  };
}
