import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class ApproveCertificateDto {
  @ApiProperty({
    example: 'Notify user',
    description: 'Notify user email',
    required: true,
  })
  @IsBoolean({ message: 'Notify user must be a boolean' })
  readonly notifyUser: boolean;
}
