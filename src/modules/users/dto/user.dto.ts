import { Role } from '@prisma/client';

export class UserDto {
  id: number;
  email: string;
  password?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}
