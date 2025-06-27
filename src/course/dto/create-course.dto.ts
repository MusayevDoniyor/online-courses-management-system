import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseLevels } from '../../common/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Backend Node.js' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Backend Node.js N18 guruhi, 8 oylik' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1400000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'uuid-of-teacher' })
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    example: ['Backend', 'Node.js', 'Programming'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  category: string[];

  @ApiProperty({ enum: CourseLevels, example: CourseLevels.BEGINNER })
  @IsEnum(CourseLevels)
  level: CourseLevels;
}
