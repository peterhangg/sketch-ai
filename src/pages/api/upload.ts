import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime";
import { config as S3Config } from "../../../config";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteSchema, uploadSchema } from "@/lib/validations";
import { deleteFile, getFileUploadUrl } from "@/lib/s3";
import { ImageFileExtension } from "@/lib/types";
import { FormidableError, parseForm } from "@/lib/form-parse";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res });
  if (!session || !session.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const userId = session.user.id;

  if (req.method == "POST") {
    try {
      const { fields } = await parseForm(req);
      const { sketchData } = uploadSchema.parse(fields);
      const sketchBuffer = Buffer.from(sketchData as string, "base64");
      const contentLength = Buffer.byteLength(sketchBuffer);

      const filename = uuidv4();
      const key = `${S3Config.s3.defaultFolder}/${filename}${ImageFileExtension.PNG}`;

      const { signedUrl } = await getFileUploadUrl({
        key,
        acl: "public-read",
      });

      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
          "Content-Length": contentLength.toString(),
        },
        body: sketchBuffer,
      });

      if (response.status !== 200) {
        throw new Error("Failed to upload image to s3");
      }

      const s3FileUrl = `${S3Config.s3.baseObjectUrl}/${key}`;

      await prisma.sketch.create({
        data: {
          userId,
          url: s3FileUrl,
        },
      });
      return res.status(200).json({ message: "Image saved and uploaded" });
    } catch (error) {
      if (error instanceof FormidableError) {
        res.status(400).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.issues });
      }
      if (error instanceof PrismaClientUnknownRequestError) {
        return res.status(400).json({ message: error.message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Something went wrong during the request" });
    }
  }

  if (req.method === "DELETE") {
    const { sketchUrl } = deleteSchema.parse(req.query);
    const fileKey = new URL(sketchUrl).pathname.substring(1);

    try {
      const deleteFromS3 = await deleteFile(fileKey);
      if (!deleteFromS3) {
        throw new Error("Error deleting file on S3 bucket");
      }

      const sketch = await prisma.sketch.findFirst({
        where: {
          userId,
          url: sketchUrl,
        },
      });
      if (sketch) {
        await prisma.sketch.delete({
          where: {
            id: sketch.id,
          },
        });
      }

      return res.status(200).json({ message: "Sketch was deleted" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.issues });
      }
      if (error instanceof PrismaClientUnknownRequestError) {
        return res.status(400).json({ message: error.message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Something went wrong during the request" });
    }
  }
}
