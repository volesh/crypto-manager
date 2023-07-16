import { ApiProperty } from '@nestjs/swagger';

export class WalletsResponse {
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
}
