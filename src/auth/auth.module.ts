import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { Course } from '../common/entities/course.entity';
import { UserModule } from '../user/user.module';
import { User } from '../common/entities/user.entity';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    MailerModule,
    TypeOrmModule.forFeature([User, Course]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy],
})
export class AuthModule {}
