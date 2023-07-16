/* eslint-disable max-len */
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwY2IxZTZjLTkyMDQtNDQ5Mi1hY2EwLTg4NzFiY2JjNDlhYSIsImlhdCI6MTY4Mzk4OTYwMiwiZXhwIjoxNjgzOTkwNTAyfQ.Qfzi1cME0uerkYNhlmC419I4l984uR-Rrrye8IjfnSc',
  })
  accessToken: string;

  @ApiProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwY2IxZTZjLTkyMDQtNDQ5Mi1hY2EwLTg4NzFiY2JjNDlhYSIsImlhdCI6MTY4Mzk4OTYwMiwiZXhwIjoxNjgzOTkwNTAyfQ.Qfzi1cME0uerkYNhlmC419I4l984uR-Rrrye8IjfnSc',
  })
  refreshToken: string;
}
