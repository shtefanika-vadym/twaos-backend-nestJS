import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/users.model';

@Entity({ name: 'replacements' })
export class Replacement {
  @ApiProperty({ description: 'The replacement unique identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The start date of the replacement.' })
  @Column({ type: 'date' })
  start_date: string;

  @ApiProperty({ description: 'The end date of the replacement.' })
  @Column({ type: 'date' })
  end_date: string;

  @ApiProperty({
    description: 'The replacement status.',
  })
  @Column({ type: 'varchar', nullable: false })
  status: string;

  @ApiProperty({ description: 'The user who is being replaced.' })
  @ManyToOne(() => User, (user: User) => user)
  replacedUser: User;

  @ApiProperty({ description: 'The user who is replacing the replaced user.' })
  @ManyToOne(() => User, (user: User) => user)
  replacingUser: User;
}
