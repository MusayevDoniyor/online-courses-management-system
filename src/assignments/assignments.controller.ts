import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request as ServerRequest } from 'express';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UpdateScoreAdmin } from './dto/update-score_admin.dto';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post(':moduleId')
  @Roles('student')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileLink: {
          type: 'string',
          example: 'https://example.com/assignment.docx',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'assignments'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async submitAssignment(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body('fileLink') fileLink: string,
    @Request() req: ServerRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const studentId = (req?.user as { id: string }).id;

    const fileUrl = file ? `/uploads/assignments/${file.filename}` : undefined;

    return this.assignmentsService.submitAssignment({
      moduleId,
      studentId,
      fileUrl,
      fileLink,
    });
  }

  @Get('my')
  @Roles('student')
  async getMyAssignments(@Request() req: ServerRequest) {
    const studentId = (req?.user as { id: string }).id;
    return this.assignmentsService.getStudentAssignments(studentId);
  }

  @Put('/grade/:resultId')
  @Roles('admin', 'teacher')
  async grade(
    @Param('resultId', ParseUUIDPipe) resultId: string,
    @Request() req: ServerRequest,
    @Body() body: UpdateScoreAdmin,
  ) {
    const graderId = (req?.user as { id: string }).id;
    return this.assignmentsService.gradeAssignment(resultId, graderId, body);
  }
}
