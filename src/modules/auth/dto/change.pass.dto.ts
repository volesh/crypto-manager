import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePassDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: number;

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
