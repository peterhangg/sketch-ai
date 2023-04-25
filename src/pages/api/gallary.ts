import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { sketchSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          sketches: true,
        },
      });

      if (!user) {
        return res.status(403).end();
      }

      const { sketches } = user;

      return res.status(200).json(sketches);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(404)
        .json({ message: "Something went wrong during the request" });
    }
  }

  if (req.method === "POST") {
    try {
      const { url } = sketchSchema.parse(req.body);

      await prisma.sketch.create({
        data: {
          userId,
          url,
        },
      });
      return res.status(200).json({ message: "Sketch saved" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(404)
        .json({ message: "Something went wrong during the request" });
    }
  }
}
