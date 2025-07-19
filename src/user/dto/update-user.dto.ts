import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  name?: string;

  // @IsEmail()
  // @IsOptional()
  // email?: string;

  // @IsString()
  // @IsOptional()
  // bio?: string;

  // @IsUrl()
  // @IsOptional()
  // avatar_url?: string;
}
