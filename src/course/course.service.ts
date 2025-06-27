import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../common/entities/course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = this.courseRepo.create(createCourseDto);
    await this.courseRepo.save(course);
    return {
      message: 'Course created successfully',
      course,
    };
  }

  async findAll() {
    const courses = await this.courseRepo.find({
      order: { created_at: 'DESC' },
    });

    if (courses.length === 0) return { message: 'Courses not available' };

    return {
      message: 'Courses found successfuly',
      count: courses.length,
      courses,
    };
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      message: 'Course found',
      course,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const { course } = await this.findOne(id);

    const updated = Object.assign(course, updateCourseDto);

    await this.courseRepo.save(updated);

    return {
      message: 'Course updated successfully',
      course: updated,
    };
  }

  async remove(id: string) {
    const { course } = await this.findOne(id);
    await this.courseRepo.remove(course);
    return { message: 'Course deleted successfully' };
  }
}
