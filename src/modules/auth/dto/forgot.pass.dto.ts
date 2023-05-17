import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FrotgotPassDto {
  @ApiProperty({ type: String, example: 'test@test.com' })
  @IsNotEmpty()
  email: string;
}
