import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaOptions: Prisma.PrismaClientOptions = {};
if (!!process.env.NEXT_PUBLIC_DEBUG)
  prismaOptions.log = ["query", "warn", "error"];

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ ...prismaOptions });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
