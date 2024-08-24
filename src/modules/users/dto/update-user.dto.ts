import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;
}
