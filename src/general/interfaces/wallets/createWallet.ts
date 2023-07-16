import { Fiat, Wallets } from '@prisma/client';

export interface CreateWalletI {
  wallet: Wallets;
  currency: Fiat;
}
