import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CoursesModule } from './module.entity';
import { CompletedLesson } from './completedLesson,entity';

@Entity({ name: 'Lessons' })
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @ManyToOne(() => CoursesModule, (module) => module.lessons, {
    onDelete: 'CASCADE',
  })
  module: CoursesModule;

  @OneToMany(() => CompletedLesson, (completed) => completed.lesson)
  completedBy: CompletedLesson[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
