import {
  ConflictException,
  Injectable,
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

interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: string;
}

export interface IUserPayload {
  id: string;
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
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'created_at'],
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
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken: string | undefined = (
      req.cookies as { refresh_token?: string }
    )?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

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

  async getProfile(userPayload: IUserPayload) {
    return await this.userRepo.findOne({
      where: {
        email: userPayload.email,
        id: userPayload.id,
      },
      select: ['id', 'name', 'email', 'role', 'created_at'],
    });
  }
}
