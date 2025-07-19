import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/types_enums/enums';

export class ChangeRoleDto {
  @ApiProperty({ example: UserRole.STUDENT })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
