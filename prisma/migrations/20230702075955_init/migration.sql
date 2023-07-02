-- CreateEnum
CREATE TYPE "Status" AS ENUM ('buy', 'sell', 'transfer');

-- CreateEnum
CREATE TYPE "CoinType" AS ENUM ('coin', 'fiat', 'stable');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('deposit', 'withdraw');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fixedIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invested" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "withdraw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isInitialized" BOOLEAN NOT NULL DEFAULT false,
    "currencyId" TEXT NOT NULL DEFAULT 'c6280c4b-4a79-4e45-8291-84d31e1e5a72',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "fromCount" DOUBLE PRECISION NOT NULL,
    "toCount" DOUBLE PRECISION NOT NULL,
    "income" DOUBLE PRECISION,
    "price_per_coin" DOUBLE PRECISION,
    "fromCoinId" TEXT NOT NULL,
    "toCoinId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchse_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coins" (
    "id" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "coinName" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "img" TEXT NOT NULL,
    "type" "CoinType" NOT NULL,
    "spendMoney" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "Coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletValues" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "WalletValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tokens" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposits" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "DepositStatus" NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "Deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionTokens" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "ActionTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiat" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Fiat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fiat_code_key" ON "Fiat"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_fromCoinId_fkey" FOREIGN KEY ("fromCoinId") REFERENCES "Coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_toCoinId_fkey" FOREIGN KEY ("toCoinId") REFERENCES "Coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallets" ADD CONSTRAINT "Wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coins" ADD CONSTRAINT "Coins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coins" ADD CONSTRAINT "Coins_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletValues" ADD CONSTRAINT "WalletValues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletValues" ADD CONSTRAINT "WalletValues_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposits" ADD CONSTRAINT "Deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposits" ADD CONSTRAINT "Deposits_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
