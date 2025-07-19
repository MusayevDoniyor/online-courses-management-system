import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IUserPayload } from 'src/auth/auth.service';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req: { user: IUserPayload },
  ) {
    const user = req.user;
    return this.courseService.create(createCourseDto, user);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get('top')
  getTopCourses(
    @Query('period') period: string,
    @Query('limit') limit: string,
  ) {
    const limitNum = parseInt(limit, 10) || 10;
    return this.courseService.getTopCourses(period, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Roles('admin', 'teacher')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.courseService.update(id, updateCourseDto, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.courseService.remove(id, user);
  }
}
