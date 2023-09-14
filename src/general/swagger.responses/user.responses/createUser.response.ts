import { ApiProperty } from '@nestjs/swagger';
import { Fiat } from '@prisma/client';

import { TokenResponse } from '../auth.responses/tokens.response';
import { FiatResponse } from '../fiat/fiat.response';

export class CreateUser {
  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'Ivan',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  currencyId: string;

  @ApiProperty({ type: FiatResponse })
  currency: Fiat;
}

export class CreateUserResponse {
  @ApiProperty({
    type: CreateUser,
  })
  user: CreateUser;

  @ApiProperty({ type: TokenResponse })
  tokens: TokenResponse;
}
