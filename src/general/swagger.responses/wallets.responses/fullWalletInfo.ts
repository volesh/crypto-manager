import { ApiProperty } from '@nestjs/swagger';

export class FullWalletInfo {
  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  id: string;

  @ApiProperty({ type: String, example: 'Binance' })
  name: string;

  @ApiProperty({
    type: Number,
    example: 300,
  })
  fixedIncome: number;

  @ApiProperty({
    type: Number,
    example: 500,
  })
  invested: number;

  @ApiProperty({
    type: Number,
    example: 1000,
  })
  withdraw: number;

  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  userId: string;

  @ApiProperty({
    type: Number,
    example: 2000,
  })
  balance: number;

  @ApiProperty({
    type: Number,
    example: 2400,
  })
  notFixedIncome: number;

  @ApiProperty({
    type: Number,
    example: 2700,
  })
  totalIncome: number;

  @ApiProperty({
    type: Number,
    example: 1000,
    required: false,
  })
  fiat: number;
}
