import type { NextApiRequest, NextApiResponse } from "next";
import { FAILED, SUCCEEDED } from "@/lib/constants";
import { generateSchema } from "@/lib/validations";
import { pollUntilDone, sleep } from "@/lib/utils";
import Ratelimiter from "@/lib/rate-limit";
import { config } from "../../../config";

interface ReplicateApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

async function getGeneratedImage(responseUrl: string): Promise<string[]> {
  if (!responseUrl) {
    throw new Error("Response url from submitted sketch is missing");
  }

  const fetchData = async (): Promise<string[]> => {
    const response = await fetch(responseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${config.replicate.apiKey}`,
      },
    });
    const data = await response.json();
    if (data.status === SUCCEEDED) {
      return data.output;
    } else if (data.status === FAILED) {
      throw new Error("Failed to generate image");
    } else {
      throw new Error("Still generating image");
    }
  };

  const generatedImage = await pollUntilDone(fetchData);
  return generatedImage;
}

const ratelimiter = new Ratelimiter();

export default async function handler(
  req: ReplicateApiRequest,
  res: NextApiResponse
) {
  if (!config.replicate.apiKey) {
    throw new Error("The REPLICATE_API_KEY environment variable is not set");
  }

  const { success, message } = await ratelimiter.validate(req, res);
  if (!success) {
    return res.status(429).json({ message });
  }

  const { imageUrl, prompt } = generateSchema.parse(req.body);
  if (!imageUrl) {
    return res.status(400).json({ message: "Please provide an image URL" });
  }

  if (!prompt) {
    return res
      .status(400)
      .json({ message: "Please provide a prompt for your sketch" });
  }

  if (req.method === "POST") {
    try {
      const response = await fetch(
        `${config.replicate.apiBaseUrl}/v1/predictions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${config.replicate.apiKey}`,
          },
          body: JSON.stringify({
            version: config.replicate.modelVersion,
            input: { image: imageUrl, prompt },
          }),
        }
      );

      const data = await response.json();
      const generatedImages = await getGeneratedImage(data?.urls?.get);
      const [_negativePromptImage, userPromptImage] = generatedImages;

      return res.status(200).json(userPromptImage);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Something went wrong during the request" });
    }
  }
}
