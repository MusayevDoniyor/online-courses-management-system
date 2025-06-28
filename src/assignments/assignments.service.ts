import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../common/entities/assigment.entity';
import { CoursesModule } from '../common/entities/module.entity';
import { Result } from '../common/entities/result.entity';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateScoreAdmin } from './dto/update-score_admin.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @InjectRepository(CoursesModule)
    private moduleRepo: Repository<CoursesModule>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Result) private resultRepo: Repository<Result>,
  ) {}

  async submitAssignment(params: {
    moduleId: string;
    studentId: string;
    fileUrl?: string;
    fileLink?: string;
  }) {
    const { moduleId, studentId, fileUrl, fileLink } = params;

    if (!fileUrl && !fileLink) {
      throw new BadRequestException('Either file or link must be provided');
    }

    const module = await this.moduleRepo.findOne({ where: { id: moduleId } });
    const student = await this.userRepo.findOne({ where: { id: studentId } });

    if (!module || !student) {
      throw new NotFoundException('Module or student not found');
    }

    const assignment = this.assignmentRepo.create({
      module,
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
      relations: ['results', 'module'],
      order: { submittedAt: 'DESC' },
    });

    const groupedByModule = assignments.reduce(
      (acc, assignment) => {
        const module = assignment.module;
        const moduleId = module.id;

        if (!acc[moduleId]) {
          acc[moduleId] = {
            module: module,
            assignments: [],
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { module: _, ...rest } = assignment;
        acc[moduleId].assignments.push(rest);

        return acc;
      },
      {} as Record<
        string,
        { module: CoursesModule; assignments: Omit<Assignment, 'module'>[] }
      >,
    );

    return Object.values(groupedByModule);
  }

  async gradeAssignment(
    resultId: string,
    graderId: string,
    dto: UpdateScoreAdmin,
  ) {
    const result = await this.resultRepo.findOne({
      where: { id: resultId },
      relations: ['assignment'],
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    result.score = dto.score;
    result.feedback = dto.feedback;
    result.isChecked = true;
    const grader = await this.userRepo.findOne({ where: { id: graderId } });
    result.gradedBy = grader ?? undefined;

    await this.resultRepo.save(result);

    return { message: 'Assignment graded successfully' };
  }
}
