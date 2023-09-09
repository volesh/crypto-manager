import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { OAuthEnum } from '../../../general/enums/oauth.enum';

export class OAuthRegisterDto {
  @ApiProperty({ type: String, example: 'someToken' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ type: String, example: 'apple' })
  @IsEnum(OAuthEnum)
  @IsNotEmpty()
  type: OAuthEnum;

  @ApiProperty({ type: String, example: 'MyName' })
  @IsNotEmpty()
  name: string;
}

export class OAuthLoginDto {
  @ApiProperty({ type: String, example: 'someToken' })
  @IsEnum(OAuthEnum)
  @IsNotEmpty()
  token: string;

  @ApiProperty({ type: String, example: 'apple' })
  @IsNotEmpty()
  type: OAuthEnum;
}
