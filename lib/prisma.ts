import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In serverless environments (Vercel), each function invocation may
// spin up a new module context. We reuse the instance where possible
// to avoid exhausting connection limits on Neon/Postgres.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Always cache in production too — prevents connection exhaustion
// (the global is reset per cold start, which is the correct behaviour)
globalForPrisma.prisma = prisma;
