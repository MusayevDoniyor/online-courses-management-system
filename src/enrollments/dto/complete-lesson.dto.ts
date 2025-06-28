import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompleteLessonDto {
  @ApiProperty({ example: 'a6defa5b-4353-4e6c-8613-010ce8d12b36' })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;
}
