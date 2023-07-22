import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String, example: 'Ivan', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name: string;

  @ApiProperty({ type: String, example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33', required: false })
  @IsOptional()
  @IsUUID()
  currencyId: string;
}
