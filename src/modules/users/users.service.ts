import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new user
   *
   * @param newUser
   *
   * @returns Promise<User>
   */
  async create(newUser: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data: newUser });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get all Users
   *
   * @returns Promise<User[]>
   */
  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Get a User by id
   *
   * @param id
   *
   * @returns Promise<User[]>
   */
  async getById(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get a User by email
   *
   * @param email
   *
   * @returns Promise<User>
   */
  async getByEmail(email: string): Promise<User> {
    try {
      return this.prisma.user.findUnique({
        where: { email },
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Update a User
   *
   * @param id
   * @param updateUserDto
   *
   * @returns Promise<User[]>
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserDto,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Delete a User
   *
   * @param id
   *
   * @returns Promise<User[]>
   */
  async remove(id: number): Promise<any> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
