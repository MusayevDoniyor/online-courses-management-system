import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':moduleId')
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Roles('admin', 'teacher')
  @Post(':moduleId')
  create(
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.lessonsService.create(moduleId, createLessonDto, user);
  }

  @Get(':lessonId/find')
  findOne(@Param('lessonId') lessonId: string) {
    return this.lessonsService.findOne(lessonId);
  }

  @Roles('admin', 'teacher')
  @Put(':lessonId')
  update(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.lessonsService.update(lessonId, updateLessonDto, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':lessonId')
  remove(@Param('lessonId') lessonId: string, @Request() req) {
    const user = req.user;
    return this.lessonsService.remove(lessonId, user);
  }
}
