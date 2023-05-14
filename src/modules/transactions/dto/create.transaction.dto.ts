import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'usd' })
  fromId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'ethereum' })
  toId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, example: 1000 })
  fromCount: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, example: 1 })
  toCount: number;
}
