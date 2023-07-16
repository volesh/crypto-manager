/*
  Warnings:

  - Added the required column `walletId` to the `WalletValues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletValues" ADD COLUMN     "walletId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AccountValues" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AccountValues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WalletValues" ADD CONSTRAINT "WalletValues_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountValues" ADD CONSTRAINT "AccountValues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
