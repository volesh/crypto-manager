import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { OAuthEnum } from '../../../general/enums/oauth.enum';

export class OAuthDto {
  @ApiProperty({ type: String, example: 'someToken' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ type: String, example: 'apple' })
  @IsEnum(OAuthEnum)
  @IsNotEmpty()
  type: OAuthEnum;
}
