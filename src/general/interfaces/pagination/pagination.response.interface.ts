import { Fiat } from '@prisma/client';

export interface PaginationResponseI<T> {
  data: T[];
  page: number;
  perPage: number;
  totalPages: number;
  currency?: Fiat;
}
