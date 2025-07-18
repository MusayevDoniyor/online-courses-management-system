import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Result } from '../common/entities/result.entity';
import { Lesson } from '../common/entities/lesson.entity';
import { Assignment } from '../common/entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Result, Lesson, Assignment])],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
