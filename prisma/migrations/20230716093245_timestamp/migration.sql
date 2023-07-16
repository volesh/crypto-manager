/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AccountValues` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WalletValues` table. All the data in the column will be lost.
  - Added the required column `timestamp` to the `AccountValues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `WalletValues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountValues" DROP COLUMN "createdAt",
ADD COLUMN     "timestamp" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WalletValues" DROP COLUMN "createdAt",
ADD COLUMN     "timestamp" INTEGER NOT NULL;
