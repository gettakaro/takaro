-- DropForeignKey
ALTER TABLE "CronJobOnGameServer" DROP CONSTRAINT "CronJobOnGameServer_cronJobId_fkey";

-- DropForeignKey
ALTER TABLE "CronJobOnGameServer" DROP CONSTRAINT "CronJobOnGameServer_gameServerId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameServerId_fkey";

-- DropForeignKey
ALTER TABLE "RoleOnUser" DROP CONSTRAINT "RoleOnUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleOnUser" DROP CONSTRAINT "RoleOnUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "RoleOnUser" ADD CONSTRAINT "RoleOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnUser" ADD CONSTRAINT "RoleOnUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameServerId_fkey" FOREIGN KEY ("gameServerId") REFERENCES "GameServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronJobOnGameServer" ADD CONSTRAINT "CronJobOnGameServer_cronJobId_fkey" FOREIGN KEY ("cronJobId") REFERENCES "CronJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronJobOnGameServer" ADD CONSTRAINT "CronJobOnGameServer_gameServerId_fkey" FOREIGN KEY ("gameServerId") REFERENCES "GameServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
