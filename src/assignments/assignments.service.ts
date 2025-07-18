import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../common/entities/assignment.entity';
import { Lesson } from '../common/entities/lesson.entity';
import { Result } from '../common/entities/result.entity';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateScoreAdmin } from './dto/update-score_admin.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Result) private resultRepo: Repository<Result>,
  ) {}

  async submitAssignment(params: {
    lessonId: string;
    studentId: string;
    fileUrl?: string;
    fileLink?: string;
  }) {
    const { lessonId, studentId, fileUrl, fileLink } = params;

    if (!fileUrl && !fileLink) {
      throw new BadRequestException('Either file or link must be provided');
    }

    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    const student = await this.userRepo.findOne({ where: { id: studentId } });

    if (!lesson || !student) {
      throw new NotFoundException('Lesson or student not found');
    }

    const assignment = this.assignmentRepo.create({
      lesson,
      student,
      fileUrl,
      fileLink,
    });
    await this.assignmentRepo.save(assignment);

    const result = this.resultRepo.create({
      assignment,
      score: undefined,
      isChecked: false,
    });
    await this.resultRepo.save(result);

    return {
      message: 'Assignment submitted successfully',
      assignmentId: assignment.id,
    };
  }

  async getStudentAssignments(studentId: string) {
    const assignments = await this.assignmentRepo.find({
      where: { student: { id: studentId } },
      relations: ['results', 'lesson'],
      order: { submittedAt: 'DESC' },
    });

    return assignments;
  }

  async gradeAssignment(
    resultId: string,
    graderId: string,
    dto: UpdateScoreAdmin,
  ) {
    const result = await this.resultRepo.findOne({
      where: { id: resultId },
      relations: [
        'assignment',
        'assignment.lesson',
        'assignment.lesson.module',
        'assignment.lesson.module.course',
        'assignment.lesson.module.course.teacher',
      ],
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    const grader = await this.userRepo.findOne({ where: { id: graderId } });

    if (
      grader?.role !== 'admin' &&
      result.assignment.lesson.module.course.teacher.id !== graderId
    ) {
      throw new ForbiddenException(
        'You are not allowed to grade this assignment',
      );
    }

    result.score = dto.score;
    result.feedback = dto.feedback;
    result.isChecked = true;
    result.gradedBy = grader ?? undefined;

    await this.resultRepo.save(result);

    return { message: 'Assignment graded successfully' };
  }
}
