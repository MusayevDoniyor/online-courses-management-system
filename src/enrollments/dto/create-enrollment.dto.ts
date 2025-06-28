import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: '9a835f6e-4c33-43be-9771-74dbb09f25a4' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
