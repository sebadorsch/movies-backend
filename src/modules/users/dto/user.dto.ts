import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
