/*
  Warnings:

  - Added the required column `walletId` to the `Deposits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deposits" ADD COLUMN     "walletId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Deposits" ADD CONSTRAINT "Deposits_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
