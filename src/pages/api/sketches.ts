import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sketch } from "@prisma/client";
import { DefaultNextApiHandler } from "@/lib/server/DefaultNextApiHandler";

interface FormattedSketch extends Omit<Sketch, "createdAt"> {
  createdAt: string;
}

interface ResponseData {
  sketches: FormattedSketch[];
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
    let cursor;

    if (req.query.cursor) {
      let dateValue = req.query.cursor;
      if (Array.isArray(dateValue)) {
        dateValue = dateValue[0];
      }

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        throw new Error("Failed to fetch sketches. Please contact admin");
      }
      cursor = date;
    }

    const sketches = await prisma.sketch.findMany({
      where: {
        AND: [{ userId }, cursor ? { createdAt: { lt: cursor } } : {}],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    const hasMore = sketches.length === 6;
    const nextCursor = hasMore
      ? sketches[sketches.length - 1].createdAt.toISOString()
      : null;

    const formattedSketches: FormattedSketch[] = sketches.map((sketch) => ({
      ...sketch,
      createdAt: sketch.createdAt.toISOString(),
    }));

    const data: ResponseData = {
      sketches: formattedSketches,
      hasMore,
      cursor: nextCursor,
    };

    return data;
  }
}

export default DefaultNextApiHandler(handler);
