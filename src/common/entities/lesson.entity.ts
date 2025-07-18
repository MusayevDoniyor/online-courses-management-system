import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Module } from './module.entity';
import { CompletedLesson } from './completedLesson.entity';
import { Assignment } from './assignment.entity';

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

  @ManyToOne(() => Module, (module) => module.lessons, {
    onDelete: 'CASCADE',
  })
  module: Module;

  @OneToMany(() => CompletedLesson, (completed) => completed.lesson)
  completedBy: CompletedLesson[];

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments: Assignment[];

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
