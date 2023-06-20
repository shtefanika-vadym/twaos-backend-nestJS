import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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
  @Column({ type: 'varchar', nullable: true })
  certificateId?: string;

  @ApiProperty({ description: 'The reason for the certificate.', example: 'For job interview' })
  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @ApiProperty({
    description: 'The certificate status.',
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

  @ApiProperty({ description: 'Creation date of the certificate.' })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @ApiProperty({ description: 'Update date of the certificate.' })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @ApiProperty({ description: 'The user the certificate belongs to.' })
  @ManyToOne(() => User, (user: User) => user.certificates)
  user: User;
}
