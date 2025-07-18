import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../common/entities/lesson.entity';
import { Repository } from 'typeorm';
import { Module } from '../common/entities/module.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
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

  async create(moduleId: string, createLessonDto: CreateLessonDto, user: any) {
    const module = await this.moduleRepo.findOne({
      where: { id: moduleId },
      relations: ['course', 'course.teacher'],
    });
    if (!module) throw new NotFoundException('Module not found');

    if (user.role !== 'admin' && module.course.teacher.id !== user.userId) {
      throw new ForbiddenException(
        'You are not allowed to add lesson to this module',
      );
    }

    const lesson = this.lessonRepo.create({ ...createLessonDto, module });
    await this.lessonRepo.save(lesson);

    return {
      message: 'Lesson created successfully',
      lesson,
    };
  }

  async findOne(lessonId: string) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course', 'module.course.teacher'],
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    return {
      message: 'Lesson found',
      lesson,
    };
  }

  async update(lessonId: string, updateLessonDto: UpdateLessonDto, user: any) {
    const { lesson } = await this.findOne(lessonId);

    if (
      user.role !== 'admin' &&
      lesson.module.course.teacher.id !== user.userId
    ) {
      throw new ForbiddenException('You are not allowed to update this lesson');
    }

    const updatedLesson = Object.assign(lesson, updateLessonDto);

    await this.lessonRepo.save(updatedLesson);

    return {
      message: 'Lesson updated successfully',
      lesson: updatedLesson,
    };
  }

  async remove(lessonId: string, user: any) {
    const { lesson } = await this.findOne(lessonId);

    if (
      user.role !== 'admin' &&
      lesson.module.course.teacher.id !== user.userId
    ) {
      throw new ForbiddenException('You are not allowed to delete this lesson');
    }

    await this.lessonRepo.remove(lesson);

    return { message: 'Lesson removed successfully' };
  }
}
