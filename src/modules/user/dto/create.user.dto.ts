import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String, example: 'Ivan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ type: String, example: 'test@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: 'Qwer1234' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 0,
    minSymbols: 0,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33' })
  @IsOptional()
  currencyId: string;
}
