import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/types_enums/enums';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: "Email manzilingiz noto'g'ri" })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  @MaxLength(32, { message: 'Parol 32 ta belgidan oshmasligi kerak' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,32}/, {
    message:
      "Parol kamida bitta katta, kichik harf, raqam va belgi o'z ichiga olishi kerak",
  })
  password: string;

  @ApiProperty({ example: UserRole.STUDENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
