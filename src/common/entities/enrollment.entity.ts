import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { CompletedLesson } from './completedLesson,entity';

@Entity({ name: 'Enrollments' })
@Unique(['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  student: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => CompletedLesson, (completed) => completed.enrollment)
  completedLessons: CompletedLesson[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  enrolled_at: Date;
}
