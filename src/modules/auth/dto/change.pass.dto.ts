import { IsNotEmpty } from 'class-validator';

export class ChangePassDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: number;

  @IsNotEmpty()
  newPassword: string;
}
