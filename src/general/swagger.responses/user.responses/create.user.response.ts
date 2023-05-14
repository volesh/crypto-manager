import { ApiProperty } from '@nestjs/swagger';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';
import { TokenResponse } from '../auth.responses/tokens.response';
import { UserResponse } from './user.response';

export class CreateUserResponse {
  @ApiProperty({ type: UserResponse })
  user: CreatedUserI;

  @ApiProperty({ type: TokenResponse })
  tokens: TokenResponse;
}
