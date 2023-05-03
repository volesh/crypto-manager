import { User } from '@prisma/client';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';

export const createUserPresenter = (user: User): CreatedUserI => {
  const {
    id,
    name,
    email,
    invested,
    fiat,
    fixedIncome,
    withdraw,
    isInitialized,
  } = user;

  return {
    id,
    name,
    email,
    invested,
    fiat,
    fixedIncome,
    withdraw,
    isInitialized,
  };
};
