import { PrismaClient } from '@prisma/client';
export { User } from '@prisma/client';

export const db = new PrismaClient();

process.on('beforeExit', async () => {
  await db.$disconnect();
});
