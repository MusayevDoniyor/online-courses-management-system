import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from '../common/entities/enrollment.entity';
import { Repository } from 'typeorm';
import { Course } from '../common/entities/course.entity';
import { User } from '../common/entities/user.entity';
import { Lesson } from '../common/entities/lesson.entity';
import { CompletedLesson } from '../common/entities/completedLesson,entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
  ) {}

  async enroll(userId: string, courseId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });

    if (!user || !course) throw new NotFoundException('Invalid course or user');

    const exists = await this.enrollmentRepo.findOne({
      where: { student: { id: userId }, course: { id: courseId } },
    });

    if (exists) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentRepo.create({
      student: user,
      course: course,
    });

    await this.enrollmentRepo.save(enrollment);

    return {
      message: 'Enrollment successful',
      enrollment,
    };
  }

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.lessonRepo.findOneBy({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.enrollmentRepo.findOne({
      where: { student: { id: userId } },
      relations: ['completedLessons', 'completedLessons.lesson', 'student'],
    });

    if (!enrollment)
      throw new NotFoundException('You are not enrolled in any course');

    const alreadyCompleted = enrollment.completedLessons.find(
      (cl) => cl.lesson.id === lessonId,
    );
    if (alreadyCompleted)
      return { message: 'Lesson already marked as completed' };

    const completedLesson = this.enrollmentRepo.manager.create(
      CompletedLesson,
      {
        enrollment,
        lesson,
        completed_at: new Date(),
      },
    );

    await this.enrollmentRepo.manager.save(CompletedLesson, completedLesson);

    return { message: 'Lesson marked as completed' };
  }

  async getProgress(userId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { student: { id: userId } },
      relations: ['course', 'completedLessons'],
    });

    return {
      message: 'Your enrollments and progress',
      enrollments,
    };
  }
}
