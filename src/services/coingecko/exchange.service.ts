import axios from 'axios';

import { envConfig } from '../../general/configs';
import { ExchangeResponseI } from '../../general/interfaces/exhange/exchange.response.interface';

export const axiosService = axios.create({
  baseURL: `https://v6.exchangerate-api.com/v6/${envConfig.exchange_api_key}`,
});

export class ExchangeService {
  static async getFiatList(code: string): Promise<ExchangeResponseI> {
    const { data } = await axiosService.get(`/latest/${code}`);
    return data;
  }
}
