import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWalletDto {
  @ApiProperty({ type: String, example: 'Binance' })
  @IsString()
  @IsOptional()
  name: string;
}
