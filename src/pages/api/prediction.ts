import type { NextApiRequest, NextApiResponse } from "next";

interface ReplicateApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

const SUCCEEDED = "succeeded";
const FAILED = "failed";
const API_URL = "https://api.replicate.com/v1/predictions";
const MODEL_VERSION =
  "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117";
const API_KEY = process.env.REPLICATE_API_KEY;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getGeneratedImage(responseUrl: string): Promise<string[]> {
  while (true) {
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
      await sleep(2000);
    }
  }
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
    return res.status(400).json({ error: "Please provide an image URL" });
  }

  if (!prompt) {
    return res
      .status(400)
      .json({ error: "Please provide a prompt for your sketch" });
  }

  if (req.method === "POST") {
    try {
      let response = await fetch(API_URL, {
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
      const generatedImage = await getGeneratedImage(urls.get);

      return res.status(200).json({ data: generatedImage });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res
        .status(404)
        .json({ error: "Something went wrong during the request" });
    }
  }
}
