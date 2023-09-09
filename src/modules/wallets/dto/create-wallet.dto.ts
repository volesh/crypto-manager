import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { CreateCoinDto } from '../../../modules/coins/dto/create.coin.dto';
import { CreateFiatDto } from '../../../modules/coins/dto/create.fiat.dto';

export class CreateWalletDto {
  @ApiProperty({ type: String, example: 'Binance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [CreateFiatDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateFiatDto)
  fiat: CreateFiatDto[];

  @ApiProperty({ type: [CreateCoinDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCoinDto)
  coins: CreateCoinDto[];
}
