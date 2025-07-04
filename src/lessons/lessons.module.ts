import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from '../common/entities/lesson.entity';
import { CoursesModule } from '../common/entities/module.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, CoursesModule])],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
