import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Prisma, Role } from '@prisma/client';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class UserDto implements Prisma.UserCreateInput {
  @ApiProperty({ description: 'The unique identifier for the user' })
  id: number;

  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @ApiProperty({ description: 'The password for the user' })
  password: string;

  @ApiProperty({ description: 'The first name of the user', required: false })
  firstName?: string;

  @ApiProperty({ description: 'The last name of the user', required: false })
  lastName?: string;

  @ApiProperty({ description: 'The role assigned to the user' })
  role: Role;
}

export class CreateUserDto extends PartialType(
  OmitType(UserDto, ['id'] as const),
) {
  @ApiProperty({ description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password for the user' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'The first name of the user', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'The last name of the user', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'The role assigned to the user',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
