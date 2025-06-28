import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Node.js Intro' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'In this lesson, we introduce the basics of Node.js, including its architecture and use cases.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: 'https://youtu.be/32M1al-Y6Ag?si=W8bezt6t9k77XjsO',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
