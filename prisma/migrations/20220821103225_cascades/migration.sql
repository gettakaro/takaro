-- DropForeignKey
ALTER TABLE "CronJob" DROP CONSTRAINT "CronJob_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Function" DROP CONSTRAINT "Function_domainId_fkey";

-- DropForeignKey
ALTER TABLE "GameServer" DROP CONSTRAINT "GameServer_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_domainId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_domainId_fkey";

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronJob" ADD CONSTRAINT "CronJob_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Function" ADD CONSTRAINT "Function_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
