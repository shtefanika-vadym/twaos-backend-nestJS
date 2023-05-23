import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { UserRole } from 'src/users/roles/user-role';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ description: 'The user unique identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The user first name.', example: 'John' })
  @Column({ type: 'varchar', nullable: false })
  first_name: string;

  @ApiProperty({ description: 'The user last name.', example: 'Doe' })
  @Column({ type: 'varchar', nullable: true })
  last_name: string;

  @ApiProperty({ description: 'The user initials.', example: 'D' })
  @Column({ type: 'varchar', nullable: true })
  initials?: string;

  @ApiProperty({ description: 'The unique user email address.', example: 'user@gmail.com' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @ApiProperty({ description: 'The user program study.', example: 'AIA' })
  @Column({ type: 'varchar', nullable: true })
  program_study: string;

  @ApiProperty({ description: 'The user year study.', example: 3 })
  @Column({ type: 'integer', nullable: true })
  year_study?: string;

  @ApiProperty({ description: 'The user budget status.', example: 'buget' })
  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @ApiProperty({ description: 'The user field study.', example: 'licenta' })
  @Column({ type: 'varchar', nullable: true })
  field_study?: string;

  @ApiProperty({ description: 'The user full name.', example: 'John D. Doe' })
  @Column({ type: 'varchar', nullable: true })
  full_name?: string;

  @ApiProperty({ description: 'The user faculty name.', example: 'FIESC' })
  @Column({ type: 'varchar', nullable: true })
  faculty_name: string;

  @ApiProperty({ description: 'The user role.', example: UserRole.student })
  @Column({ type: 'varchar', nullable: true })
  role: string;

  @ApiProperty({ description: 'The user password.', example: '12345%' })
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty({ description: 'The certificates belonging to the user.' })
  @OneToMany(() => Certificate, (certificate: Certificate) => certificate.user)
  certificates: Certificate[];
}
