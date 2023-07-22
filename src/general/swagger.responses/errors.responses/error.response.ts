import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ type: Number, example: 400 })
  statusCode: number;

  @ApiProperty({ type: String, example: 'Error message' })
  message: string;

  @ApiProperty({ type: String, example: 'Bad Request' })
  error: string;
}
