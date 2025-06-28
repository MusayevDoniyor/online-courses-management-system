import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'JavaScript Module' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'JavaScript Module - Variables, Loops, Functions, OOP',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
