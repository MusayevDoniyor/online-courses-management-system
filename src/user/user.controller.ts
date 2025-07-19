import { Controller, Get, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types_enums/enums';
import { RolesGuard } from '../common/guards/roles.guard';
import { IUserPayload } from 'src/auth/auth.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  getProfile(@Req() req: { user: IUserPayload }) {
    return this.userService.findById(req.user.userId);
  }

  @Patch('profile')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  updateProfile(
    @Req() req: { user: IUserPayload },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.userId, updateUserDto);
  }
}
