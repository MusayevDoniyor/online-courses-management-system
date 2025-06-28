import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':moduleId')
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Post(':moduleId')
  create(
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @Get(':lessonId/find')
  findOne(@Param('lessonId') lessonId: string) {
    return this.lessonsService.findOne(lessonId);
  }

  @Put(':lessonId')
  update(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(lessonId, updateLessonDto);
  }

  @Delete(':lessonId')
  remove(@Param('lessonId') lessonId: string) {
    return this.lessonsService.remove(lessonId);
  }
}
