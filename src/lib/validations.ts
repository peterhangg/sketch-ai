import z from "zod";

export const promptSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "Prompt description of image is required" }),
});

export const generateSchema = z.object({
  imageUrl: z.string().min(1),
  prompt: z.string().min(1),
});

export const uploadSchema = z.object({
  sketchData: z.string(),
  imageModel: z.string(),
});

export const deleteSchema = z.object({
  sketchUrl: z.string(),
});
