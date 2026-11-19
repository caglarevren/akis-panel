import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

// Next.js dev server hot-reloads modules on every request; without caching
// the client on `globalThis`, each reload would open a new Neon connection
// pool. See: https://pris.ly/d/help/next-js-best-practices
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
