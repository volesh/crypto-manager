export interface GetUserI {
  id: string;
  name: string;
  email: string;
  fixedIncome: number;
  fiat: number;
  invested: number;
  withdraw: number;
  balance?: number;
  notFixedIncome?: number;
  totalIncome?: number;
}
