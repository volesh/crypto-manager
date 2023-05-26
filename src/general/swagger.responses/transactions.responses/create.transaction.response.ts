import { ApiProperty } from '@nestjs/swagger';
export class CreateTransactionResponse {
  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  id: string;

  @ApiProperty({
    type: Number,
    example: 1000,
  })
  fromCount: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  toCount: number;

  @ApiProperty({
    type: Number,
    example: null,
  })
  income: number | null;

  @ApiProperty({
    type: Number,
    example: 1000,
  })
  price_per_coin: number;

  @ApiProperty({
    type: String,
    example: 'USD',
  })
  fromCoinId: string;

  @ApiProperty({
    type: String,
    example: 'ethereum',
  })
  toCoinId: string;

  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  userId: string;

  @ApiProperty({
    type: Number,
    example: '1000',
  })
  purchse_price: number;

  @ApiProperty({
    type: String,
    example: 'buy',
  })
  status: string;

  @ApiProperty({
    type: String,
    example: '2023-05-13T15:23:30.276Z',
  })
  createdAt: Date;
}
