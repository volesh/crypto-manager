import { Fiat, Wallets } from '@prisma/client';

export interface GetAllWalletsI {
  data: Wallets[];
  currency: Fiat;
}
