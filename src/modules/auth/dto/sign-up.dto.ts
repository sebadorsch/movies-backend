import { IsString, IsEmpty, IsEmail } from 'class-validator';
import { Role } from '@prisma/client';
import { SignInDto } from './sign-in.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsString()
  lastName?: string;
}
