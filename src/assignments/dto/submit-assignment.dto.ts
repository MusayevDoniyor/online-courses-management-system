import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    example: 'https://example.com/assignment.docx',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileLink?: string;
}
