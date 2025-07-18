import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/types_enums/enums';
import { Course } from '../common/entities/course.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
    const totalCourses = await this.courseRepository.count();

    return {
      totalUsers,
      totalCourses,
    };
  }
}
