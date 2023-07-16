import { ApiProperty } from '@nestjs/swagger';
import { Fiat } from '@prisma/client';
import { GetAllWalletsI } from 'src/general/interfaces/wallets/getAllWallets';

import { FiatResponse } from '../fiat/fiat.response';
import { WalletsResponse } from './wallet.response';

export class WalletValues implements GetAllWalletsI {
  @ApiProperty({
    type: [WalletsResponse],
  })
  data: WalletsResponse[];

  @ApiProperty({
    type: FiatResponse,
  })
  currency: Fiat;
}
