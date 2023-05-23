import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({ description: 'Token' })
  token: string;

  @ApiProperty({ description: 'Admin' })
  role: string;
}
