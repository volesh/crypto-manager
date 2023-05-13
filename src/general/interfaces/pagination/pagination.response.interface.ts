export interface PaginationResponseI<T> {
  data: T[];
  page: number;
  perPage: number;
  totalPages: number;
}
