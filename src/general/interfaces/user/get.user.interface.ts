import { Fiat } from '@prisma/client';

export interface GetUserI {
  id: string;
  name: string;
  email: string;
  fixedIncome: number;
  fiat: number;
  invested: number;
  withdraw: number;
  balance: number;
  isInitialized: boolean;
  notFixedIncome: number;
  totalIncome: number;
  defaultCurrency: string
  password?: string;
  currency?: Fiat;
}
