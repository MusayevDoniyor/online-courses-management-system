import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Course } from '../common/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
