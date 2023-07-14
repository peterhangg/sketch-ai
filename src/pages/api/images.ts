import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiImage, Sketch } from "@prisma/client";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";
import { getImagesSchema } from "@/lib/validations";
import { SKETCH } from "@/lib/constants";

interface FormattedSketch extends Omit<Sketch, "createdAt"> {
  createdAt: string;
}

interface FormattedAiImage extends Omit<AiImage, "createdAt"> {
  createdAt: string;
}

interface ResponseData {
  images: FormattedSketch[] | FormattedAiImage[];
  hasMore: boolean;
  cursor: string | null;
}

const isValidDate = (dateObject: any) =>
  new Date(dateObject).toString() !== "Invalid Date";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { message: string }>
) {
  const session = await getServerAuthSession({ req, res });
  if (!session || !session.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const userId = session.user.id;

  if (req.method === "GET") {
    const { cursor, imageModel } = getImagesSchema.parse(req.query);
    let currentCursor: string | Date = "";

    if (isValidDate(cursor) && typeof cursor === "string") {
      let dateValue = cursor;
      if (Array.isArray(dateValue)) {
        dateValue = dateValue[0];
      }

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        throw new Error("Failed to fetch images. Please contact admin");
      }
      currentCursor = date;
    }

    const prismaModel = imageModel === SKETCH ? prisma.sketch : prisma.aiImage;
    const images = await prismaModel.findMany({
      where: {
        AND: [
          { userId },
          currentCursor ? { createdAt: { lt: currentCursor } } : {},
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    const hasMore = images.length === 6;
    const nextCursor = hasMore
      ? images[images.length - 1].createdAt.toISOString()
      : null;

    const formattedImages: FormattedSketch[] = images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    }));

    const data: ResponseData = {
      images: formattedImages,
      hasMore,
      cursor: nextCursor,
    };

    return data;
  }
}

export default DefaultNextApiHandler(handler);
