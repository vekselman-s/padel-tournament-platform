// Re-export everything from Prisma Client (enums, types, PrismaClient)
export * from '@prisma/client'

// Export NestJS specific modules and services
export { PrismaService } from './prisma.service'
export { PrismaModule } from './prisma.module'
