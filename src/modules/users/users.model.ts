import { Prisma, Role } from '@prisma/client';

export class User implements Prisma.UserCreateInput {
  id: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}
