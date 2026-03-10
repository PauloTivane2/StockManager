import { PrismaClient } from "@prisma/client";

// Mantenha apenas uma instância do Prisma Client 
// em ambientes de desenvolvimento (evita esgotar conexões com hot-reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
