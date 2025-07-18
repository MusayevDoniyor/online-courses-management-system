import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from '../common/entities/module.entity';
import { Course } from '../common/entities/course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async findModulesByCourse(courseId: string) {
    const modules = await this.moduleRepo.find({
      where: { course: { id: courseId } },
      relations: ['course'],
    });

    if (modules.length == 0)
      return { message: 'Modules are not available in this course' };

    return {
      message: 'All modules for this course',
      modules,
    };
  }

  async findOne(id: string) {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!module) throw new NotFoundException('Module not found');
    return { module };
  }

  async create(courseId: string, createModuleDto: CreateModuleDto, user: any) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException('Course not found');

    if (user.role !== 'admin' && course.teacher.id !== user.userId) {
      throw new ForbiddenException(
        'You are not allowed to add module to this course',
      );
    }

    const module = this.moduleRepo.create({
      ...createModuleDto,
      course: { id: courseId },
    });

    await this.moduleRepo.save(module);

    const createdModule = await this.moduleRepo.findOne({
      where: { id: module.id },
      relations: ['course'],
      select: {
        id: true,
        title: true,
        description: true,
        course: {
          id: true,
          name: true,
          description: true,
          price: true,
          teacher: true,
          category: true,
          level: true,
          created_at: true,
        },
        created_at: true,
      },
    });

    return {
      message: 'Module successfully added to course',
      module: createdModule,
    };
  }

  async update(id: string, updateModuleDto: UpdateModuleDto, user: any) {
    const { module } = await this.findOne(id);

    if (user.role !== 'admin' && module.course.teacher.id !== user.userId) {
      throw new ForbiddenException('You are not allowed to update this module');
    }

    const updated = Object.assign(module, updateModuleDto);
    await this.moduleRepo.save(updated);

    return {
      message: 'Module updated successfully',
      module: updated,
    };
  }

  async remove(id: string, user: any) {
    const { module } = await this.findOne(id);

    if (user.role !== 'admin' && module.course.teacher.id !== user.userId) {
      throw new ForbiddenException('You are not allowed to delete this module');
    }

    await this.moduleRepo.remove(module);

    return {
      message: 'Module successfully removed from course',
    };
  }
}
