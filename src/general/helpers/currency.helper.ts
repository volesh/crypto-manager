import { Fiat } from '@prisma/client';
import Decimal from 'decimal.js';

export class CurrencyHelper {
  static calculateCurrency<T>(data: T, fields: string[], currency: Fiat): T {
    const price = new Decimal(currency.price);
    fields.forEach((field) => {
      if (data[field]) {
        const elem = new Decimal(data[field]);

        // data[field] = data[field] * currency.price
        data[field] = Number(elem.times(price));
      }
    });
    return data;
  }
}
