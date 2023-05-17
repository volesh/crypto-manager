import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateCoinDto } from 'src/modules/coins/dto/create.coin.dto';

export class InitUserDto {
  @ApiProperty({ type: Number, example: 1900 })
  @IsNumber()
  @IsNotEmpty()
  fiat: number;

  @ApiProperty({ type: [CreateCoinDto] })
  @IsArray()
  @IsNotEmpty()
  coins: CreateCoinDto[];
}
