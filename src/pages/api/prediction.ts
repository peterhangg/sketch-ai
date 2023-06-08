import type { NextApiRequest, NextApiResponse } from "next";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";
import { FAILED, SUCCEEDED } from "@/lib/constants";
import { generateSchema } from "@/lib/validations";
import { poll } from "@/lib/utils";
import { config } from "../../../config";
import { Replicate } from "@/lib/types";

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

  const fetchReplicate = async (): Promise<Replicate> => {
    const response = await fetch(responseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${config.replicate.apiKey}`,
      },
    });
    const data = await response.json();
    return data;
  };

  try {
    const data = await poll({
      fn: fetchReplicate,
      validateFn: (result) => result.status === SUCCEEDED,
      exitFn: (result) => result.status === FAILED,
    });
    return data.output;
  } catch (error) {
    throw new Error("Failed to generate image. Please contact admin.");
  }
}

async function handler(
  req: ReplicateApiRequest,
  _res: NextApiResponse<string | { message: string }>
) {
  if (!config.replicate.apiKey) {
    throw new Error("The REPLICATE_API_KEY environment variable is not set.");
  }

  const { imageUrl, prompt } = generateSchema.parse(req.body);

  if (!imageUrl) {
    throw new Error("Sketch was not provided.");
  }

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
          input: {
            image: imageUrl,
            prompt,
            a_prompt:
              "best quality, extremely detailed, ultra-detailed, ultra-realistic, cinematic photo",
            n_prompt:
              "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
          },
        }),
      }
    );

    const data: Replicate = await response.json();
    if (!data?.urls) {
      throw new Error(
        "Unexpected error occured while generating image. Please contact admin."
      );
    }

    const generatedImages = await getGeneratedImage(data.urls.get);
    const [_negativePromptImage, userPromptImage] = generatedImages;

    return userPromptImage;
  }
}

export default DefaultNextApiHandler(handler);
