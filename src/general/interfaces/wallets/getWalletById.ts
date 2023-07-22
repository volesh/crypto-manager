import { Fiat } from '@prisma/client';

export interface GetOneWalletI {
  wallet: {
    id: string;
    name: string;
    fixedIncome: number;
    invested: number;
    withdraw: number;
    userId: string;
    notFixedIncome: number;
    fiat: number;
    balance: number;
    totalIncome: number;
  };
  currency: Fiat;
}
