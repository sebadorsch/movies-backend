import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFilterParams, hashPassword } from '../../utils/utils';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger();

  constructor(private prisma: PrismaService) {}

  /**
   * Create new user
   *
   * @param user
   *
   * @returns Promise<UserDto>
   */
  async create(user: CreateUserDto): Promise<UserDto> {
    try {
      if ((await this.get({ email: user.email })).length)
        throw new ConflictException(`User already exists`);

      const isHashed =
        user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

      if (!isHashed) {
        user.password = await hashPassword(user.password);
      }

      return await this.prisma.user.create({ data: user });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error creating user',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Get filtered or all Users
   *
   * @returns Promise<UserDto[]>
   */
  async get(filterParams: Partial<UserDto>): Promise<UserDto[]> {
    try {
      const filters = getFilterParams(filterParams);

      const users = this.prisma.user.findMany({
        where: filters,
      });

      if (!users) throw new NotFoundException('Users not found');

      return users;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error getting users',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Get a User by id
   *
   * @param id
   *
   * @returns Promise<UserDto[]>
   */
  async getById(id: number): Promise<UserDto> {
    try {
      const user = this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error getting user',
        e.response?.statusCode ?? 409,
      );
    }
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
      if ((await this.get({ id })).length === 0)
        throw new NotFoundException('User not found');

      return await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserDto,
          edited: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error updating user',
        e.response?.statusCode ?? 409,
      );
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
    try {
      if (!(await this.prisma.user.findUnique({ where: { id } })))
        throw new NotFoundException('User not found');

      return this.prisma.user.delete({
        where: { id },
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error deleting user',
        e.response?.statusCode ?? 409,
      );
    }
  }
}
