/*
  Warnings:

  - The `capabilities` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CAPABILITIES" AS ENUM ('ROOT', 'MANAGE_USERS', 'READ_USERS');

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "capabilities",
ADD COLUMN     "capabilities" "CAPABILITIES"[];
