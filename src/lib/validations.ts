import z from "zod";

export const promptSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "Prompt description of image is required" }),
});

export const sketchSchema = z.object({
  url: z.string(),
});

export const generateSchema = z.object({
  imageUrl: z.string().min(1),
  prompt: z.string().min(1),
});
