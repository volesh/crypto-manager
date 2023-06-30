import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { DepositsEnum } from 'src/general/enums/deposits.enum';

export class CreateDepositDto {
  @ApiProperty({ type: Number, example: 500 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    type: String,
    example: 'UAH',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: String,
    example: 'deposit',
  })
  @IsEnum(DepositsEnum)
  @IsNotEmpty()
  status: DepositsEnum;
}
