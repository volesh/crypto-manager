import { Fiat } from '@prisma/client';

export class CurrencyHelper {
  static calculateCurrency<T>(data: T, fields: string[], currency: Fiat): T {
    fields.forEach((elem) => {
      data[elem] = data[elem] * currency.price;
    });
    return data;
  }
}
