import { User } from '@prisma/client';
import { ResponseUserI } from 'src/general/interfaces/user/response.user.interface';

export const createUserPresenter = (user: User): ResponseUserI => {
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
