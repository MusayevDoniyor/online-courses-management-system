import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../common/entities/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesModule])],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
