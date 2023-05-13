import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCoinDto {
  @IsString()
  @IsNotEmpty()
  coinId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  spendMoney: number;
}
