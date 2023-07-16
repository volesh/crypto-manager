import { ApiProperty } from '@nestjs/swagger';
import { Fiat } from '@prisma/client';
import { CreateWalletI } from 'src/general/interfaces/wallets/createWallet';

import { FiatResponse } from '../fiat/fiat.response';
import { WalletsResponse } from './wallet.response';

export class CreateWallet implements CreateWalletI {
  @ApiProperty({
    type: WalletsResponse,
  })
  wallet: WalletsResponse;

  @ApiProperty({
    type: FiatResponse,
  })
  currency: Fiat;
}
