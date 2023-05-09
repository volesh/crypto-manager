-- CreateEnum
CREATE TYPE "Status" AS ENUM ('buy', 'sell', 'transfer');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'sell';
