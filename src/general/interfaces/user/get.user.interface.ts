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
  notFixedIncome: number;
  totalIncome: number;
  password?: string;
  currencyId: string;
  currency?: Fiat;
}
