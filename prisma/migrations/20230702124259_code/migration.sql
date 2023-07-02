/*
  Warnings:

  - You are about to drop the column `currency` on the `Deposits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deposits" DROP COLUMN "currency",
ADD COLUMN     "code" TEXT NOT NULL DEFAULT 'USD';
