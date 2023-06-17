/*
  Warnings:

  - You are about to drop the column `isFiat` on the `Coins` table. All the data in the column will be lost.
  - Added the required column `type` to the `Coins` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CoinType" AS ENUM ('coin', 'fiat', 'stable');

-- AlterTable
ALTER TABLE "Coins" DROP COLUMN "isFiat",
ADD COLUMN     "type" "CoinType" NOT NULL;
