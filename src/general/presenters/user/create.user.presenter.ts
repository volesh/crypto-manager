import { User } from '@prisma/client';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';

export const createUserPresenter = (user: User): CreatedUserI => {
  const { password, ...rest } = user;

  return rest;
};
