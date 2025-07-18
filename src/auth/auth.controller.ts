import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Request,
  Req,
  Delete,
} from '@nestjs/common';
import { AuthService, IUserPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request as ServerRequest, Response } from 'express';
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
    const { refresh_token, ...authRes } =
      await this.authService.login(loginDto);

    const cookieConfigs = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.cookie('access_token', authRes.access_token, cookieConfigs);

    res.cookie('refresh_token', refresh_token, cookieConfigs);

    return authRes;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/refresh')
  async refresh(
    @Req() req: ServerRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req: { user: IUserPayload }) {
    return this.authService.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  delete(
    @Req() req: { user: IUserPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.deleteProfile(req.user.userId);
  }
}
