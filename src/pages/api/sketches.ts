import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sketch } from "@prisma/client";

interface FormattedSketch extends Omit<Sketch, "createdAt"> {
  createdAt: string;
}

interface ResponseData {
  sketches: FormattedSketch[];
  hasMore: boolean;
  cursor: string | null;
}

export default async function handler(
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
    let cursor = req.query.cursor
      ? new Date(req.query.cursor.toString())
      : undefined;

    try {
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

      const response: ResponseData = {
        sketches: formattedSketches,
        hasMore,
        cursor: nextCursor,
      };

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
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