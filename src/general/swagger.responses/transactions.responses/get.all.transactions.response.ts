import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionResponse } from './create.transaction.response';
import { FiatResponse } from '../fiat/fiat.response';

export class GetAllTransactionsResponse {
  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  perPage: number;

  @ApiProperty({ type: Number, example: 23 })
  totalPages: number;

  @ApiProperty({ type: FiatResponse })
  currency: FiatResponse;

  @ApiProperty({ type: [CreateTransactionResponse] })
  data: CreateTransactionResponse[];
}
