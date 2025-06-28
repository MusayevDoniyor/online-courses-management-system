import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesModule } from '../common/entities/module.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(CoursesModule)
    private moduleRepo: Repository<CoursesModule>,
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

  async create(courseId: string, createModuleDto: CreateModuleDto) {
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

  async remove(id: string) {
    const module = await this.moduleRepo.findOne({ where: { id } });
    if (!module) throw new NotFoundException('Module not found');

    await this.moduleRepo.delete(id);

    return {
      message: 'Module successfully removed from course',
    };
  }
}
