import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/types_enums/enums';
import { Course } from '../common/entities/course.entity';
import { Enrollment } from '../common/entities/enrollment.entity';
import { Lesson } from '../common/entities/lesson.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async findAllUsers() {
    return this.userRepository.find();
  }

  async findAllTeachers() {
    return this.userRepository.find({
      where: { role: UserRole.TEACHER },
    });
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new Error('Invalid role');
    }
    user.role = role as UserRole;
    return this.userRepository.save(user);
  }

  async removeUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }

  async getStatsOverview() {
    const totalUsers = await this.userRepository.count();
    const totalStudents = await this.userRepository.count({
      where: { role: UserRole.STUDENT },
    });
    const totalTeachers = await this.userRepository.count({
      where: { role: UserRole.TEACHER },
    });
    const totalAdmins = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const totalCourses = await this.courseRepository.count();
    const totalEnrollments = await this.enrollmentRepository.count();
    const totalLessons = await this.lessonRepository.count();

    return {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
      },
      courses: {
        total: totalCourses,
      },
      enrollments: {
        total: totalEnrollments,
      },
      lessons: {
        total: totalLessons,
      },
    };
  }
}
