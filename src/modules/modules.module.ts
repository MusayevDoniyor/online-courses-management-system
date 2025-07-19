import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as CourseModuleEntity } from '../common/entities/module.entity';
import { Course } from '../common/entities/course.entity';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseModuleEntity, Course]),
    CourseModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
