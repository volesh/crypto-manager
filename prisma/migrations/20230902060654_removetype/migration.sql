/*
  Warnings:

  - You are about to drop the column `type` on the `Tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tokens" DROP COLUMN "type";

-- DropEnum
DROP TYPE "TokenType";
