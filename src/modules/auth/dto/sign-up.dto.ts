import { IsString, IsEmpty } from 'class-validator';
import { Role } from '@prisma/client';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsEmpty()
  role?: Role;
}
