import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Test Test',
    description: 'Name',
    required: true,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(255, {
    message: 'Name must be shorter than or equal to 255 characters',
  })
  readonly name: string;

  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Email',
    required: true,
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @MaxLength(255, {
    message: 'Email must be shorter than or equal to 255 characters',
  })
  readonly email: string;

  @ApiProperty({ example: '12345', description: 'Password', required: true })
  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(16, {
    message: 'Password must be shorter than or equal to 16 characters',
  })
  readonly password: string;
}
