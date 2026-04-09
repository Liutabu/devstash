import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const createPrismaClient = () => {
  const url = new URL(process.env.DATABASE_URL!);
  if (!url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', 'verify-full');
  }
  const adapter = new PrismaPg({ connectionString: url.toString() });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
