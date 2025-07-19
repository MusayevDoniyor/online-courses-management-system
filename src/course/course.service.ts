import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(createCourseDto: CreateCourseDto, user: any) {
    const { teacherId, ...courseDetails } = createCourseDto;
    let teacher: User;

    if (user.role === 'admin') {
      if (!teacherId) {
        throw new NotFoundException(
          'teacherId must be provided when admin creates a course',
        );
      }
      const foundTeacher = await this.userRepo.findOne({
        where: { id: teacherId },
      });
      if (!foundTeacher) throw new NotFoundException('Teacher not found');
      teacher = foundTeacher;
    } else {
      const foundTeacher = await this.userRepo.findOne({
        where: { id: user.userId },
      });
      if (!foundTeacher) throw new NotFoundException('Teacher not found');
      teacher = foundTeacher;
    }

    const course = this.courseRepo.create({
      ...courseDetails,
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

  async getTopCourses(period: string, limit: number) {
    const topCourses = await this.courseRepo.find({
      order: { enrollmentCount: 'DESC' },
      take: limit,
      relations: ['teacher'],
    });

    return {
      message: 'Top courses retrieved successfully',
      count: topCourses.length,
      courses: topCourses,
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

  async update(id: string, updateCourseDto: UpdateCourseDto, user: any) {
    const { course } = await this.findOne(id);

    if (user.role !== 'admin' && course.teacher.id !== user.userId) {
      throw new ForbiddenException('You are not allowed to update this course');
    }

    const updated = Object.assign(course, updateCourseDto);

    await this.courseRepo.save(updated);

    return {
      message: 'Course updated successfully',
      course: updated,
    };
  }

  async remove(id: string, user: any) {
    const { course } = await this.findOne(id);

    if (user.role !== 'admin' && course.teacher.id !== user.userId) {
      throw new ForbiddenException('You are not allowed to delete this course');
    }

    await this.courseRepo.remove(course);
    return { message: 'Course deleted successfully' };
  }
}
