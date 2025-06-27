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
import { CoursesModule } from './module.entity';
import { Enrollment } from './enrollment.entity';

export enum CourseLevels {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

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
    eager: false, // optional: `true` bo‘lsa avtomatik `join`
    nullable: true,
  })
  teacher: User;

  @Column('simple-array')
  category: string[];

  @OneToMany(() => CoursesModule, (module) => module.course)
  modules: CoursesModule[];

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
