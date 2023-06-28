import { Fiat } from "@prisma/client";

export interface CreatedUserI {
  id: string;
  name: string;
  email: string;
  fixedIncome: number;
  fiat?: number;
  invested: number;
  withdraw: number;
  isInitialized: boolean;
}
