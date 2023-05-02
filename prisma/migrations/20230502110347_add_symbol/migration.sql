/*
  Warnings:

  - Added the required column `symbol` to the `Coins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coins" ADD COLUMN     "symbol" TEXT NOT NULL;
