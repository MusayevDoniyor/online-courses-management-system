import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import { MailerService } from '../mailer/mailer.service';

interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: string;
}

export interface IUserPayload {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: registerDto.email },
    });

    if (userExists) throw new ConflictException('Email already registered');

    const user = this.userRepo.create(registerDto);

    await this.userRepo.save(user);

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
      select: ['id', 'full_name', 'email', 'password', 'role', 'created_at'],
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials. User not registered',
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      message: 'User logged in successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken: string | undefined = (
      req.cookies as { refresh_token?: string }
    )?.refresh_token;
    if (!refreshToken) throw new ForbiddenException('Access Denied');

    const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
      refreshToken,
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      },
    );

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('User not found');

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_SECRET')!,
        expiresIn: '30m',
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Access token refreshed' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.reset_password_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepo.save(user);

    const resetURL = `http://localhost:5173/auth/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail(
      user.email,
      'Password Reset Token',
      `Your password reset token is: ${resetToken}`,
      `<p>To reset your password, please click on this link: <a href="${resetURL}">${resetURL}</a></p>`,
    );

    return { message: 'Password reset token sent to your email' };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    if (resetPasswordDto.password !== resetPasswordDto.confirm_password) {
      throw new ConflictException('Passwords do not match');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepo.findOne({
      where: {
        reset_password_token: hashedToken,
      },
    });

    if (
      !user ||
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    user.password = await bcrypt.hash(resetPasswordDto.password, 12);
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await this.userRepo.save(user);

    return { message: 'Password has been reset successfully' };
  }
}
