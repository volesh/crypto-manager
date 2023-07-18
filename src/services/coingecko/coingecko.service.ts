import axios from 'axios';
import { baseURL, urls } from 'src/general/configs';
import { CoinMarketI } from 'src/general/interfaces/coingecko/coin.market.interface';
import { CoinsListI } from 'src/general/interfaces/coingecko/coins.list.interface';

export const axiosService = axios.create({ baseURL });

export class CoingeckoService {
  static async getCoinsList(): Promise<CoinsListI[]> {
    const { data } = await axiosService.get(urls.coinsList);
    return data;
  }

  static async getCoinMarkest(ids: string[], currency = 'usd'): Promise<CoinMarketI[]> {
    const idsString = ids.join('%2C%20');
    const { data } = await axiosService.get(`${urls.coinsMarket}?vs_currency=${currency}&ids=${idsString}`);
    return data;
  }
}
