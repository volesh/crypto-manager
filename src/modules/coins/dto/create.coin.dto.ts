import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCoinDto {
  @ApiProperty({
    type: String,
    example: 'bitcoin',
  })
  @IsString()
  @IsNotEmpty()
  coinId: string;

  @ApiProperty({
    type: Number,
    example: 300,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    type: Number,
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  spendMoney: number;
}
