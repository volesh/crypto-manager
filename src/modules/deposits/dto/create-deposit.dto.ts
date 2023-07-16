import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { DepositsEnum } from 'src/general/enums';

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

  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  @IsString()
  @IsNotEmpty()
  walletId: string;
}
