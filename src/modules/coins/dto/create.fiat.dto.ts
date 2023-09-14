import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFiatDto {
  @ApiProperty({
    type: String,
    example: 'UAH',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: Number,
    example: 300,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
