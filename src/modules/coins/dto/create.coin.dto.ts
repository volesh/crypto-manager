import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCoinDto {
  @IsString()
  @IsNotEmpty()
  coinId: string;

  @IsString()
  @IsNotEmpty()
  coinName: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  spendMoney: number;

  @IsString()
  @IsNotEmpty()
  img: string;
}
