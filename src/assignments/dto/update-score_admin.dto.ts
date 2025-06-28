import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateScoreAdmin {
  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  score: number;

  @ApiProperty({ example: 'Good Job', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}
