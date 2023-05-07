import { Transactions } from '@prisma/client';

export interface TransactionsResponseI {
  transactions: Transactions[];
  page: number;
  perPage: number;
  totalPages: number;
}
