/*
  Warnings:

  - Added the required column `code` to the `Function` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Function" ADD COLUMN     "code" TEXT NOT NULL;
