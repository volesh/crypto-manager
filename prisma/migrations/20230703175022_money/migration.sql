/*
  Warnings:

  - You are about to drop the column `fixedIncome` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `invested` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `withdraw` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "fixedIncome",
DROP COLUMN "invested",
DROP COLUMN "withdraw";
