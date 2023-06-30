import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CoinTypeEnum } from 'src/general/enums';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'USD' })
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

  @IsEnum(CoinTypeEnum)
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'coin' })
  toCoinType: CoinTypeEnum;
}
