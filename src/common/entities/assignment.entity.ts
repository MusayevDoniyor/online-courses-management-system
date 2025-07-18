import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';
import { Result } from './result.entity';

@Entity({ name: 'Assignments' })
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.assignments, {
    onDelete: 'CASCADE',
  })
  student: User;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true })
  fileLink?: string;

  @OneToMany(() => Result, (result) => result.assignment, {
    cascade: true,
  })
  results: Result[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;
}
