import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionResponse } from './create.transaction.response';

export class GetAllTransactionsResponse {
  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  perPage: number;

  @ApiProperty({ type: Number, example: 23 })
  totalPages: number;

  @ApiProperty({ type: [CreateTransactionResponse] })
  data: CreateTransactionResponse[];
}
