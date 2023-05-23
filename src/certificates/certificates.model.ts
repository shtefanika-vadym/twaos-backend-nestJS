import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/users.model';

@Entity({ name: 'certificates' })
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The certificate unique identifier.',
    example: '321/2/FIESC/19.10.2023',
  })
  @Column({ type: 'varchar', nullable: false })
  certificateId: string;

  @ApiProperty({ description: 'The reason for the certificate.', example: 'For job interview' })
  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @ApiProperty({
    description: 'The certificate status. True if approved, false otherwise',
    example: 'pending',
  })
  @Column({ type: 'varchar', nullable: false })
  status: string;

  @ApiProperty({
    description: 'The reason rejecting',
    example: 'Is not good reason',
  })
  @Column({ type: 'varchar', nullable: true })
  rejectReason?: string;

  @ApiProperty({ description: 'The user the certificate belongs to.' })
  @ManyToOne(() => User, (user: User) => user.certificates)
  user: User;
}
