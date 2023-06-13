import type { NextApiRequest, NextApiResponse } from "next";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";
import { config } from "../../../../config";
import { Replicate } from "@/lib/types";

interface ReplicateApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

async function handler(
  req: ReplicateApiRequest,
  _res: NextApiResponse<Replicate | { message: string }>
) {
  if (req.method === "GET") {
    const { id } = req.query;
    const response = await fetch(
      `${config.replicate.apiBaseUrl}/v1/predictions/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${config.replicate.apiKey}`,
        },
      }
    );
    const data = await response.json();
    // TODO: Integrate logger
    if (process.env.NEXT_PUBLIC_DEBUG) {
      console.log("Generating image: ", data);
    }
    return data;
  }
}

export default DefaultNextApiHandler(handler);
