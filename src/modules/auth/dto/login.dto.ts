import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, example: 'test@test.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: 'Qwer1234' })
  @IsNotEmpty()
  password: string;
}
