import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateCoinDto } from 'src/modules/coins/dto/create.coin.dto';

export class InitUserDto {
  @IsNumber()
  @IsNotEmpty()
  fiat: number;

  @IsNumber()
  @IsNotEmpty()
  invested: number;

  @IsNumber()
  @IsNotEmpty()
  fixedIncome;

  @IsArray()
  @IsNotEmpty()
  coins: CreateCoinDto[];
}
