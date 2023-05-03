import { urls } from 'src/general/configs/coingecko.config';
import { axiosService } from './axios.service';
import { CoinsListI } from 'src/general/interfaces/coingecko/coins.list.interface';
import { CoinMarketI } from 'src/general/interfaces/coingecko/coin.market.interface';

export class CoingeckoService {
  static async getCoinsList(): Promise<CoinsListI[]> {
    const { data } = await axiosService.get(urls.coinsList);
    return data;
  }

  static async getCoinMarkest(
    ids: string[],
    currency = 'usd',
  ): Promise<CoinMarketI[]> {
    const idsString = ids.join('%2C%20');
    const { data } = await axiosService.get(
      `${urls.coinsMarket}?vs_currency=${currency}&ids=${idsString}`,
    );
    return data;
  }
}
