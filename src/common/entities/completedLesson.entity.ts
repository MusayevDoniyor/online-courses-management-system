import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Lesson } from './lesson.entity';

@Entity({ name: 'CompletedLesson' })
export class CompletedLesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.completedLessons, {
    onDelete: 'CASCADE',
  })
  enrollment: Enrollment;

  @ManyToOne(() => Lesson, (lesson) => lesson.completedBy, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  completed_at: Date;
}
