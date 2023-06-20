import { ApiProperty } from '@nestjs/swagger';

export class ReplacementResponse {
  @ApiProperty({ description: 'Replacement id' })
  id: number;

  @ApiProperty({ description: 'Replacement start date' })
  start_date: string;

  @ApiProperty({ description: 'Replacement end date' })
  end_date: string;

  @ApiProperty({ description: 'Replacement status' })
  status: string;

  @ApiProperty({ description: 'Replacing secretary first name' })
  first_name: string;

  @ApiProperty({ description: 'Replacing secretary last name' })
  last_name: string;

  @ApiProperty({ description: 'Replacing secretary email' })
  email: string;

  @ApiProperty({ description: 'Replacing secretary program study' })
  program_study: string;
}
