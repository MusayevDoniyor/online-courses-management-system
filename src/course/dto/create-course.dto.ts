import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseLevels } from '../../common/types_enums/enums';
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

  @ApiProperty({ example: 'dd81df63-dc98-426d-bcb9-d4fe7f49921c' })
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
