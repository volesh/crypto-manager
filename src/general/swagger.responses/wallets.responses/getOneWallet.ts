import { ApiProperty } from '@nestjs/swagger';

import { FiatResponse } from '../fiat/fiat.response';
import { FullWalletInfo } from './fullWalletInfo';

export class GetOneWallet {
  @ApiProperty({ type: FullWalletInfo })
  wallet: FullWalletInfo;

  @ApiProperty({ type: FiatResponse })
  currency: FiatResponse;
}
