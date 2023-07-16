/*
  Warnings:

  - Added the required column `date` to the `AccountValues` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `AccountValues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `date` to the `WalletValues` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `WalletValues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AccountValues" ADD COLUMN     "date" TEXT NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WalletValues" ADD COLUMN     "date" TEXT NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" INTEGER NOT NULL;
