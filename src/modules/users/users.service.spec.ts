import { HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { Role } from '@prisma/client';
import { getFilterParams, hashPassword } from '../../utils/utils';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('../../utils/utils', () => ({
  hashPassword: jest.fn(),
  getFilterParams: jest.fn(),
}));

describe('UsersService', (): void => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach((): void => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaService;
    service = new UsersService(prisma);
  });

  describe('create', (): void => {
    it('should create a new user', async (): Promise<void> => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: '123456',
        role: Role.USER,
      };

      const hashedPassword = 'hashed_password';

      const createdUser = {
        id: 14,
        email: 'test12234@test.com',
        password: 'hashedpassword',
        role: Role.USER,
        firstName: null,
        lastName: null,
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'get').mockResolvedValue([]);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if user already exists', async (): Promise<void> => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: '123456',
        role: Role.USER,
      };
      const existingUser: UserDto = {
        id: 1,
        email: createUserDto.email,
        password: createUserDto.password,
        role: createUserDto.role ?? Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'get').mockResolvedValue([existingUser]);

      try {
        await service.create(createUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('User already exists');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('get', (): void => {
    it('should return an array of users', async (): Promise<void> => {
      const filters = { email: 'test@example.com' };

      (getFilterParams as jest.Mock).mockReturnValue(filters);

      const users = [
        {
          id: 14,
          email: 'test@example.com',
          password: 'hashedpassword',
          role: Role.USER,
          firstName: null,
          lastName: null,
          created: new Date(),
          edited: new Date(),
        },
      ];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users);

      const result = await service.get({ email: 'test@example.com' });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(users);
    });

    it('should throw NotFoundException if no users found', async (): Promise<void> => {
      const filters = {};

      (getFilterParams as jest.Mock).mockReturnValue(filters);

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      try {
        await service.get({ email: 'nonexistent@example.com' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('User already exists');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('getById', (): void => {
    it('should return a user by id', async (): Promise<void> => {
      const userDto = {
        id: 14,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.USER,
        firstName: null,
        lastName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        created: new Date(),
        edited: new Date(),
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userDto);

      const result = await service.getById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(userDto);
    });

    it('should throw NotFoundException if user not found', async (): Promise<void> => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      try {
        await service.getById(1);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('User not found');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('update', (): void => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
      };
      const userDto = {
        id: 14,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.USER,
        firstName: null,
        lastName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'get').mockResolvedValue([userDto]);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(userDto);

      const result = await service.update(1, updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...updateUserDto, edited: expect.any(Date) },
      });
      expect(result).toEqual(userDto);
    });

    it('should throw NotFoundException if user to update does not exist', async (): Promise<void> => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };

      jest.spyOn(service, 'get').mockResolvedValue([]);
      try {
        await service.update(1, updateUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('User not found');
        expect(e.status).toBe(404);
      }
    });
  });

  describe('remove', (): void => {
    it('should delete a user and return the deleted user', async (): Promise<void> => {
      const id = 1;
      const userDto = {
        id: 14,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.USER,
        firstName: null,
        lastName: null,
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userDto);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(userDto);

      const result = await service.remove(id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(userDto);
    });

    it('should throw NotFoundException if user does not exist', async (): Promise<void> => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.remove(1);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('User not found');
        expect(e.status).toBe(404);
      }
    });

    it('should throw HttpException if there is an error deleting the user', async (): Promise<void> => {
      const error = new Error('Database error');

      const userDto = {
        id: 14,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.USER,
        firstName: null,
        lastName: null,
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userDto);

      jest.spyOn(prisma.user, 'delete').mockRejectedValue(error);

      try {
        await service.remove(1);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
