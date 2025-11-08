import { PrismaClient } from '@prisma/client'

/**
 * Singleton Prisma Client
 * Prevents multiple instances in development with hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
