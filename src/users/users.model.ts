import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Certificate } from 'src/certificates/certificates.model';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ description: 'The user unique identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The user name.', example: 'John Doe' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ApiProperty({ description: 'The unique user email address.', example: 'user@gmail.com' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @ApiProperty({ description: 'The user password.', example: '12345%' })
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty({ description: 'The certificates belonging to the user.' })
  @OneToMany(() => Certificate, (certificate: Certificate) => certificate.user)
  certificates: Certificate[];
}
