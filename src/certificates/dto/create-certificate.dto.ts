import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    example: 'For job interview',
    description: 'Reason for the certificates',
    required: true,
  })
  @IsString({ message: 'Reason must be a string' })
  @MinLength(1, { message: 'Reason must not be empty' })
  @MaxLength(255, {
    message: 'Reason be shorter than or equal to 255 characters',
  })
  readonly reason: string;
}
