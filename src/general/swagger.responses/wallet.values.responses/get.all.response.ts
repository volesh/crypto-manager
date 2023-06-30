import { ApiProperty } from '@nestjs/swagger';
import { Fiat } from '@prisma/client';

import { FiatResponse } from '../fiat/fiat.response';

class WalletValues {
  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  id: string;

  @ApiProperty({
    type: Date,
    example: '2023-05-13T10:08:11.553Z',
  })
  crearedAte: Date;

  @ApiProperty({
    type: Number,
    example: 2547.73,
  })
  amount: number;

  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  userId: string;
}

export class GetAllWalletValues {
  @ApiProperty({
    type: [WalletValues],
  })
  data: WalletValues;

  @ApiProperty({
    type: FiatResponse,
  })
  currency: Fiat;
}
