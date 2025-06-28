import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { User } from './common/entities/user.entity';
import { Course } from './common/entities/course.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StatsInterceptor } from './common/interceptors/stats.interceptor';
import { Enrollment } from './common/entities/enrollment.entity';
import { Lesson } from './common/entities/lesson.entity';
import { CoursesModule } from './common/entities/module.entity';
import { ModulesModule } from './modules/modules.module';
import { CompletedLesson } from './common/entities/completedLesson,entity';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

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
            CoursesModule,
            CompletedLesson,
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
