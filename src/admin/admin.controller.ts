import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChangeRoleDto } from './dto/change-role-admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('teachers')
  findAllTeachers() {
    return this.adminService.findAllTeachers();
  }

  @Get('users')
  @Roles('admin')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Put('users/:id/role')
  @Roles('admin')
  updateUserRole(@Param('id') id: string, @Body() body: ChangeRoleDto) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Delete('users/:id')
  @Roles('admin')
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  @Get('stats')
  @Roles('admin')
  getStatsOverview() {
    return this.adminService.getStatsOverview();
  }
}
