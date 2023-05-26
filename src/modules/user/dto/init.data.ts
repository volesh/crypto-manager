import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateCoinDto } from 'src/modules/coins/dto/create.coin.dto';
import { CreateFiatDto } from 'src/modules/coins/dto/create.fiat.dto';

export class InitUserDto {
  @ApiProperty({ type: [CreateFiatDto] })
  @IsArray()
  @IsNotEmpty()
  fiat: CreateFiatDto[];

  @ApiProperty({ type: [CreateCoinDto] })
  @IsArray()
  @IsNotEmpty()
  coins: CreateCoinDto[];
}
