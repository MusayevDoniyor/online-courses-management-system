import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from './user.entity';

@Entity({ name: 'Results' })
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.results, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;

  @ManyToOne(() => User)
  gradedBy?: User;

  @Column({ type: 'float', nullable: true })
  score?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ default: false })
  isChecked: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  evaluatedAt: Date;
}
