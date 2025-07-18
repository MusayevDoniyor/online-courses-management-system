import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get(':courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findModulesByCourse(courseId);
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Roles('admin', 'teacher')
  @Post(':courseId')
  create(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.modulesService.create(courseId, createModuleDto, user);
  }

  @Roles('admin', 'teacher')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.modulesService.update(id, updateModuleDto, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.modulesService.remove(id, user);
  }
}
