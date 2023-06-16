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

export const getPredictionSchema = z.object({
  id: z.string(),
});

export const getImagesSchema = z.object({
  cursor: z.string().optional(),
  imageModel: z.string(),
});

export const uploadSchema = z.object({
  sketchData: z.string(),
  imageModel: z.string(),
});

export const deleteSchema = z.object({
  imageUrl: z.string(),
  imageModel: z.string(),
});
