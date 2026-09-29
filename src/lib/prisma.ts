import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb(
  {
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,

    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
    initSql: [
      "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;",
      "SET collation_connection = 'utf8mb4_unicode_ci';",
    ],
  },
  {
    useTextProtocol: true,
  }
);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}