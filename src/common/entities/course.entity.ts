import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Module } from './module.entity';
import { Enrollment } from './enrollment.entity';
import { CourseLevels } from '../types_enums/enums';

@Entity({ name: 'Courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => User, (user) => user.courses, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  teacher: User;

  @Column('simple-array')
  category: string[];

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @Column({
    type: 'enum',
    enum: CourseLevels,
    default: CourseLevels.BEGINNER,
  })
  level: CourseLevels;

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
