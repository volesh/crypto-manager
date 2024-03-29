import { ApiProperty } from '@nestjs/swagger';

import { FiatResponse } from '../fiat/fiat.response';
import { CoinsResponse } from './coins.response';

export class GetAllCoinsResponse {
  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  perPage: number;

  @ApiProperty({ type: Number, example: 23 })
  totalPages: number;

  @ApiProperty({ type: FiatResponse })
  currency: FiatResponse;

  @ApiProperty({ type: [CoinsResponse] })
  data: CoinsResponse[];
}
