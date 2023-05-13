import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { DepositsEnum } from 'src/general/enums/deposits.enum';

export class CreateDepositDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsEnum(DepositsEnum)
  @IsNotEmpty()
  status: DepositsEnum;
}
