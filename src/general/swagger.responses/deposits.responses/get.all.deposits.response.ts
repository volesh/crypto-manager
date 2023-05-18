import { ApiProperty } from '@nestjs/swagger';
import { DepositResponse } from './deposit.response';

export class GetAllDepositsResponse {
  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  perPage: number;

  @ApiProperty({ type: Number, example: 23 })
  totalPages: number;

  @ApiProperty({ type: [DepositResponse] })
  data: DepositResponse[];
}
