import type { NextApiRequest, NextApiResponse } from "next";
import {
  API_KEY,
  REPLICATE_API_BASE_URL,
  FAILED,
  MODEL_VERSION,
  SUCCEEDED,
} from "@/lib/constants";

interface ReplicateApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollUntilDone<T>(
  fn: () => Promise<T>,
  intervalMs = 1000,
  timeoutMs = 30000
): Promise<T> {
  const start = Date.now();

  while (true) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (Date.now() - start > timeoutMs) {
        if (error instanceof Error) {
          throw new Error(
            `Function timed out after ${timeoutMs} ms: ${error.message}`
          );
        } else {
          throw new Error(
            `Function timed out after ${timeoutMs} ms: Unknown error occurred`
          );
        }
      }
    }
    await sleep(intervalMs);
  }
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
        Authorization: `Token ${API_KEY}`,
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

export default async function handler(
  req: ReplicateApiRequest,
  res: NextApiResponse
) {
  if (!API_KEY) {
    throw new Error("The REPLICATE_API_KEY environment variable is not set");
  }

  const { imageUrl, prompt } = req.body;

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
      let response = await fetch(`${REPLICATE_API_BASE_URL}/v1/predictions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${API_KEY}`,
        },
        body: JSON.stringify({
          version: MODEL_VERSION,
          input: { image: imageUrl, prompt },
        }),
      });

      const { urls } = await response.json();
      const generatedImages = await getGeneratedImage(urls?.get);
      const [_negativePromptImage, userPromptImage] = generatedImages;

      return res.status(200).json(userPromptImage);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(404)
        .json({ message: "Something went wrong during the request" });
    }
  }
}
