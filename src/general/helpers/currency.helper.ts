import { Fiat } from '@prisma/client';
import Decimal from 'decimal.js';

export class CurrencyHelper {
  static calculateCurrency<T>(data: T, fields: string[], currency: Fiat): T {
    const price = new Decimal(currency.price);
    fields.forEach((field) => {
      if (data[field]) {
        const elem = new Decimal(data[field]);

        // data[field] = data[field] * currency.price
        let number: Decimal | string = elem.times(price);

        if (number.lessThan(1)) {
          number = number.toFixed(6);
        } else {
          number = number.toFixed(2);
        }
        data[field] = Number(number.valueOf());
      }
    });
    return data;
  }
}
