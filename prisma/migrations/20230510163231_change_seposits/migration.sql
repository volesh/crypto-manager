/*
  Warnings:

  - Changed the type of `status` on the `Deposits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('deposit', 'withdraw');

-- AlterTable
ALTER TABLE "Deposits" DROP COLUMN "status",
ADD COLUMN     "status" "DepositStatus" NOT NULL;
