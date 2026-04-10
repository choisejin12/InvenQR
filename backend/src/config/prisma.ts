import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as typeof global & {
  prisma?: PrismaClient;
};

// PrismaClient를 서비스마다 새로 만들지 않고 공용으로 재사용합니다.
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
