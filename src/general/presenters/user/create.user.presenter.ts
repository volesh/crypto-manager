import { User } from '@prisma/client';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';

type AnyObjectType = Record<string, any>;

export const createUserPresenter = <T extends AnyObjectType>(user: T): Omit<T, 'password'> => {
  const { password, ...rest } = user;

  return rest;
};
