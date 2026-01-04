/**
 * Prisma Client
 *
 * Singleton instance of Prisma Client for database operations.
 * Prevents multiple instances in development due to hot reloading.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
