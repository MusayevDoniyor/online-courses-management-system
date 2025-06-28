import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../common/entities/enrollment.entity';
import { Course } from '../common/entities/course.entity';
import { User } from '../common/entities/user.entity';
import { Lesson } from '../common/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Course, User, Lesson])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
