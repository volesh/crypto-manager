import { ApiProperty } from '@nestjs/swagger';

export class Stringresponse {
  @ApiProperty({ type: String, example: 'Some message' })
  status: string;
}
