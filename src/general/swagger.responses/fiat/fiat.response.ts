import { ApiProperty } from '@nestjs/swagger';

export class FiatResponse {
  @ApiProperty({
    type: String,
    example: 'aa12ecdb-852e-4c3f-8cce-2e5b213bac33',
  })
  id: string;

  @ApiProperty({
    type: Date,
    example: '2023-05-26 16:08:41.589',
  })
  updatedAt: Date;

  @ApiProperty({
    type: String,
    example: 'USD',
  })
  code: string;

  @ApiProperty({
    type: String,
    example: 'Dollar',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: '$',
  })
  symbol: string;

  @ApiProperty({
    type: String,
    example: 'https://www.imgurl.com',
  })
  img: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  price: number;
}
