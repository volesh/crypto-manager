/*
  Warnings:

  - Added the required column `walletId` to the `Coins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coins" ADD COLUMN     "walletId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Coins" ADD CONSTRAINT "Coins_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
