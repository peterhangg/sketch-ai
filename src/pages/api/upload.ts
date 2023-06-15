import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { config as S3Config } from "../../../config";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteSchema, uploadSchema } from "@/lib/validations";
import { deleteFile, getFileUploadUrl } from "@/lib/s3";
import { ImageFileExtension } from "@/lib/types";
import { parseForm } from "@/lib/form-parse";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";
import { AI_IMAGE, SKETCH } from "@/lib/constants";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });
  if (!session || !session.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const userId = session.user.id;

  if (req.method == "POST") {
    const { fields } = await parseForm(req);
    const { sketchData, imageModel } = uploadSchema.parse(fields);

    if (imageModel === SKETCH) {
      const userSketchCount = await prisma.sketch.count({
        where: {
          userId,
        },
      });

      if (userSketchCount >= 18) {
        throw new Error(
          "Exceeded the maximum number of saved sketches (18). You can delete old sketches."
        );
      }
    }

    if (imageModel === AI_IMAGE) {
      const userAiImageCount = await prisma.aiImage.count({
        where: {
          userId,
        },
      });

      if (userAiImageCount >= 18) {
        throw new Error(
          "Exceeded the maximum number of saved AI Images (18). You can delete old AI Images."
        );
      }
    }

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
      throw new Error("Failed to upload image to S3.");
    }

    const s3FileUrl = `${S3Config.s3.baseObjectUrl}/${key}`;

    if (imageModel === SKETCH) {
      await prisma.sketch.create({
        data: {
          userId,
          url: s3FileUrl,
        },
      });
    }

    if (imageModel === AI_IMAGE) {
      await prisma.aiImage.create({
        data: {
          userId,
          url: s3FileUrl,
        },
      });
    }
    return { message: "Image saved and uploaded." };
  }

  if (req.method === "DELETE") {
    const { sketchUrl } = deleteSchema.parse(req.query);
    const fileKey = new URL(sketchUrl).pathname.substring(1);

    const deleteFromS3 = await deleteFile(fileKey);
    if (!deleteFromS3) {
      throw new Error("Error deleting file on S3 bucket.");
    }

    const sketch = await prisma.sketch.findFirst({
      where: { userId, url: sketchUrl },
    });
    const aiImage = await prisma.aiImage.findFirst({
      where: { userId, url: sketchUrl },
    });

    if (sketch || aiImage) {
      const model = sketch ? prisma.sketch : prisma.aiImage;
      const id = sketch ? sketch.id : aiImage?.id;
      await model.delete({ where: { id } });

      return { message: `${sketch ? "Sketch" : "AI image"} was deleted.` };
    }
    throw new Error("Sketch/image does not exist.");
  }
}

export default DefaultNextApiHandler(handler);
