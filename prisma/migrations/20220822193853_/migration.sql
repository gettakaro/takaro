/*
  Warnings:

  - Added the required column `connectionInfo` to the `GameServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameServer" ADD COLUMN     "connectionInfo" JSONB NOT NULL;
