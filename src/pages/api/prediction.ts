import type { NextApiRequest, NextApiResponse } from "next";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";
import { FAILED, SUCCEEDED } from "@/lib/constants";
import { generateSchema } from "@/lib/validations";
import { pollUntilDone } from "@/lib/utils";
import { config } from "../../../config";

interface ReplicateApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

async function getGeneratedImage(responseUrl: string): Promise<string[]> {
  if (!responseUrl) {
    throw new Error(
      "Response url from submitted sketch is missing. Please contact admin."
    );
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
      throw new Error("Something went wrong while generating image.");
    }
  };

  const generatedImage = await pollUntilDone(fetchData);
  return generatedImage;
}

async function handler(req: ReplicateApiRequest, _res: NextApiResponse) {
  if (!config.replicate.apiKey) {
    throw new Error("The REPLICATE_API_KEY environment variable is not set.");
  }

  const { imageUrl } = generateSchema.parse(req.body);

  if (!imageUrl) {
    throw new Error("Please provide an image URL.");
  }
  let prompt = "";
  if (!prompt) {
    throw new Error("Please provide a prompt for your sketch.");
  }

  if (req.method === "POST") {
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

    return userPromptImage;
  }
}

export default DefaultNextApiHandler(handler);
