import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './common/entities/user.entity';
import { Course } from './common/entities/course.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StatsInterceptor } from './common/interceptors/stats.interceptor';
import { Enrollment } from './common/entities/enrollment.entity';
import { Lesson } from './common/entities/lesson.entity';
import { Module as CourseModule } from './common/entities/module.entity';
import { ModulesModule } from './modules/modules.module';
import { CompletedLesson } from './common/entities/completedLesson.entity';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { Assignment } from './common/entities/assignment.entity';
import { Result } from './common/entities/result.entity';
import { AssignmentsModule } from './assignments/assignments.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url,
          // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          entities: [
            User,
            Course,
            Enrollment,
            Lesson,
            CourseModule,
            CompletedLesson,
            Assignment,
            Result,
          ],
          synchronize: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CourseModule,
    ModulesModule,
    LessonsModule,
    EnrollmentsModule,
    AssignmentsModule,
    AdminModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: StatsInterceptor,
    },
  ],
})
export class AppModule {}
