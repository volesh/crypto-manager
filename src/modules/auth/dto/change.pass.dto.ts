import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePassDto {
  @ApiProperty({ type: String, example: 'test@test.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: Number, example: 385624 })
  @IsNotEmpty()
  code: number;

  @ApiProperty({ type: String, example: 'Qwer1234' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 0,
    minSymbols: 0,
  })
  @IsNotEmpty()
  newPassword: string;
}
