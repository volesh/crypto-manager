import { Fiat } from '@prisma/client';

export const fiatPresenter = <T>(data: T, listOfFields: string[], fiat: Fiat): T => {
  const dataForResponse = { ...data };
  listOfFields.forEach((elem) => {
    dataForResponse[elem] = dataForResponse[elem] * fiat.price;
  });
  return dataForResponse;
};
