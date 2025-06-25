import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService, IUserPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('access_token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authRes = await this.authService.login(loginDto);
    res.cookie('access_token', authRes.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return authRes;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req: { user: IUserPayload }) {
    return this.authService.getProfile(req.user);
  }
}
