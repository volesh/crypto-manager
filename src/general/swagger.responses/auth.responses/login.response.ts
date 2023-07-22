import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './../user.responses/user.response';
import { TokenResponse } from './tokens.response';

export class LoginResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({ type: TokenResponse })
  tokens: TokenResponse;
}
