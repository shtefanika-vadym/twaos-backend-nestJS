import { ApiProperty } from '@nestjs/swagger';

export class SelectResponse {
  @ApiProperty({ description: 'react' })
  readonly label: string;

  @ApiProperty({ description: 'React' })
  readonly value: string;
}
