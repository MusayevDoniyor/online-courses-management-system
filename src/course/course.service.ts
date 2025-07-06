import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../common/entities/course.entity';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const teacher = await this.userRepo.findOne({
      where: { id: createCourseDto.teacherId },
    });

    if (!teacher) throw new NotFoundException('Teacher not found');

    const course = this.courseRepo.create({
      ...createCourseDto,
      teacher,
    });

    await this.courseRepo.save(course);
    return {
      message: 'Course created successfully',
      course: {
        id: course.id,
        name: course.name,
        price: course.price,
        category: course.category,
        level: course.level,
        teacher: {
          id: course.teacher.id,
          email: course.teacher.email,
          name: course.teacher.name,
        },
        created_at: course.created_at,
      },
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
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['modules', 'modules.lessons'],
      order: { created_at: 'DESC' },
    });
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
