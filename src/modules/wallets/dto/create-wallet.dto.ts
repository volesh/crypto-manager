import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CreateCoinDto } from 'src/modules/coins/dto/create.coin.dto';
import { CreateFiatDto } from 'src/modules/coins/dto/create.fiat.dto';

export class CreateWalletDto {
  @ApiProperty({ type: String, example: 'Binance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [CreateFiatDto] })
  @IsArray()
  @IsNotEmpty()
  fiat: CreateFiatDto[];

  @ApiProperty({ type: [CreateCoinDto] })
  @IsArray()
  @IsNotEmpty()
  coins: CreateCoinDto[];
}
