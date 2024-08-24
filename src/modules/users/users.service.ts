import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getFilterParams } from '../../utils/utils';
import { CreateUserDto, UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new user
   *
   * @param newUser
   *
   * @returns Promise<UserDto>
   */
  async create(newUser: CreateUserDto): Promise<UserDto> {
    try {
      return await this.prisma.user.create({ data: newUser });
    } catch (e) {
    }
  }

  /**
   * Get filtered or all Users
   *
   * @returns Promise<UserDto[]>
   */
  async get(filterParams: Partial<UserDto>): Promise<UserDto[]> {
    const filters = getFilterParams(filterParams);

    return this.prisma.user.findMany({
      where: filters,
    });
  }

  /**
   * Get a User by id
   *
   * @param id
   *
   * @returns Promise<UserDto[]>
   */
  async getById(id: number): Promise<UserDto> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update a User
   *
   * @param id
   * @param updateUserDto
   *
   * @returns Promise<UserDto[]>
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
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
    }
  }

  /**
   * Delete a User
   *
   * @param id
   *
   * @returns Promise<User>
   */
  async remove(id: number): Promise<UserDto> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
