import { User } from '@prisma/client';

export const createUserPresenter = (user: User) => {
  const { id, name, email, invested, fiat, fixedIncome, withdraw } = user;
  return {
    id,
    name,
    email,
    invested,
    fiat,
    fixedIncome,
    withdraw,
  };
};
