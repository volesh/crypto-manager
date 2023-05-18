import { ApiProperty } from '@nestjs/swagger';
export class UserResponse {
  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'Ivan',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    type: Number,
    example: 300,
  })
  fixedIncome: number;

  @ApiProperty({
    type: Number,
    example: 1000,
    required: false,
  })
  fiat: number;

  @ApiProperty({
    type: Number,
    example: 3000,
  })
  invested: number;

  @ApiProperty({
    type: Number,
    example: 1100,
  })
  withdraw: number;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  isInitialized: boolean;

  @ApiProperty({
    type: Number,
    example: 2000,
  })
  balance: number;

  @ApiProperty({
    type: Number,
    example: 2400,
  })
  notFixedIncome: number;

  @ApiProperty({
    type: Number,
    example: 2700,
  })
  totalIncome: number;
}
