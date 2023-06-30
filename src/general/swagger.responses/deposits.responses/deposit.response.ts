import { ApiProperty } from '@nestjs/swagger';
import { DepositStatus } from '@prisma/client';

export class DepositResponse {
  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  id: string;

  @ApiProperty({ type: Date, example: '2023-05-13T15:23:30.276Z' })
  createdAt: Date;

  @ApiProperty({ type: Number, example: 500 })
  amount: number;

  @ApiProperty({ type: String, example: 'UAH' })
  currency: string;

  @ApiProperty({ type: String, example: 'deposit' })
  status: DepositStatus;

  @ApiProperty({
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  userId: string;
}
