/*
  Warnings:

  - You are about to drop the column `walletId` on the `Coins` table. All the data in the column will be lost.
  - You are about to drop the column `walletId` on the `Deposits` table. All the data in the column will be lost.
  - You are about to drop the column `walletId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `walletId` on the `WalletValues` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Coins" DROP CONSTRAINT "Coins_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Deposits" DROP CONSTRAINT "Deposits_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_walletId_fkey";

-- DropForeignKey
ALTER TABLE "WalletValues" DROP CONSTRAINT "WalletValues_walletId_fkey";

-- AlterTable
ALTER TABLE "Coins" DROP COLUMN "walletId";

-- AlterTable
ALTER TABLE "Deposits" DROP COLUMN "walletId";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "walletId";

-- AlterTable
ALTER TABLE "WalletValues" DROP COLUMN "walletId";
