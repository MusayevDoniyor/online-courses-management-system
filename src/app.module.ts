import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { User } from './auth/entities/user.entity';
import { Course } from './course/entities/course.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StatsInterceptor } from './common/interceptors/stats.interceptor';

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
          entities: [User, Course],
          synchronize: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CourseModule,
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
