import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../common/entities/lesson.entity';
import { Repository } from 'typeorm';
import { CoursesModule } from '../common/entities/module.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(CoursesModule)
    private moduleRepo: Repository<CoursesModule>,
  ) {}

  async findByModule(moduleId: string) {
    const lessons = await this.lessonRepo.find({
      where: { module: { id: moduleId } },
      relations: ['module'],
    });

    if (lessons.length === 0)
      return { message: 'No lessons found in this module' };

    return {
      message: 'Lessons in this module',
      lessons,
    };
  }

  async create(moduleId: string, createLessonDto: CreateLessonDto) {
    const module = await this.moduleRepo.findOne({
      where: { id: moduleId },
    });
    if (!module) throw new NotFoundException('Module not found');

    const lesson = this.lessonRepo.create({ ...createLessonDto, module });
    await this.lessonRepo.save(lesson);

    return {
      message: 'Lesson created successfully',
      lesson,
    };
  }

  async findOne(lessonId: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });

    if (!lesson) throw new NotFoundException('Lesson not found');

    return {
      message: 'Lesson found',
      lesson,
    };
  }

  async update(lessonId: string, updateLessonDto: UpdateLessonDto) {
    const { lesson } = await this.findOne(lessonId);

    const updatedLesson = Object.assign(lesson, updateLessonDto);

    await this.lessonRepo.save(updatedLesson);

    return {
      message: 'Lesson updated successfully',
      lesson: updatedLesson,
    };
  }

  async remove(lessonId: string) {
    await this.findOne(lessonId);

    await this.lessonRepo.delete({ id: lessonId });

    return { message: 'Lesson removed successfully' };
  }
}
