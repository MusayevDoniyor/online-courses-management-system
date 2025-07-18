import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Roles('teacher', 'student')
  @Post()
  enroll(@Req() req: Request, @Body() dto: CreateEnrollmentDto) {
    return this.service.enroll((req?.user as { id: string }).id, dto.courseId);
  }

  @Roles('admin', 'teacher')
  @Get(':courseId')
  getEnrollmentsByCourse(@Param('courseId') courseId: string) {
    return this.service.getEnrollmentsByCourse(courseId);
  }

  @Roles('admin', 'teacher')
  @Delete(':enrollmentId')
  unenroll(@Param('enrollmentId') enrollmentId: string) {
    return this.service.unenroll(enrollmentId);
  }

  @Roles('student')
  @Post('complete')
  completeLesson(@Req() req: Request, @Body() dto: CompleteLessonDto) {
    return this.service.completeLesson(
      (req?.user as { id: string }).id,
      dto.lessonId,
    );
  }

  @Roles('student')
  @Get('progress')
  getProgress(@Req() req: Request) {
    return this.service.getProgress((req?.user as { id: string }).id);
  }
}
