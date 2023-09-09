import { ApiProperty } from '@nestjs/swagger';

import { CoinTypeEnum } from '../../enums';

export class CoinsResponse {
  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  id: string;

  @ApiProperty({ type: String, example: 'bitcoin' })
  coinId: string;

  @ApiProperty({ type: String, example: 'Bitcoin' })
  coinName: string;

  @ApiProperty({ type: String, example: 'btc' })
  symbol: string;

  @ApiProperty({ type: Number, example: 0.2 })
  amount: number;

  @ApiProperty({ type: String, example: 'https://www.google.com/' })
  img: string;

  @ApiProperty({ type: String, example: 'coin' })
  type: CoinTypeEnum;

  @ApiProperty({ type: Number, example: 4000 })
  spendMoney: number;

  @ApiProperty({ type: Number, example: 20000 })
  avgPrice: number;

  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  userId: string;
}
