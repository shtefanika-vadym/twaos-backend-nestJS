import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class CreateReplacementDto {
  @ApiProperty({
    example: '2023-01-01',
    required: true,
    description: 'Replacement start date',
  })
  @IsDateString(undefined, { message: 'Invalid date string' })
  readonly start_date: string;

  @ApiProperty({
    example: '2023-01-10',
    required: true,
    description: 'Replacement end date',
  })
  @IsDateString(undefined, { message: 'Invalid date string' })
  readonly end_date: string;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'Secretary Id',
  })
  @IsNumber(undefined, { message: 'Pharmacy Id must be a number' })
  secretary_id: number;
}
