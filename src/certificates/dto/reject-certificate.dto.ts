import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class RejectCertificateDto {
  @ApiProperty({
    example: 'Notify user',
    description: 'Notify user email',
    required: true,
  })
  @IsBoolean({ message: 'Reject reason must be a boolean' })
  readonly notifyUser: boolean;

  @ApiProperty({
    example: 'For job interview',
    description: 'Reason for the certificates',
    required: true,
  })
  @IsString({ message: 'Reject reason must be a string' })
  @MinLength(1, { message: 'Reject reason must not be empty' })
  @MaxLength(255, {
    message: 'Reject reason be shorter than or equal to 255 characters',
  })
  readonly rejectReason: string;
}
