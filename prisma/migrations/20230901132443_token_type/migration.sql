/*
  Warnings:

  - Added the required column `type` to the `Tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('jwt', 'google', 'apple');

-- AlterTable
ALTER TABLE "Tokens" ADD COLUMN     "type" "TokenType" NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL;
