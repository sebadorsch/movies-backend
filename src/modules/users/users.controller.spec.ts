import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { ConflictException } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', (): void => {
  let userController: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    get: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile();

    userController = module.get<UsersController>(UsersController);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create a new user', async (): Promise<void> => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };
      const result: Omit<UserDto, 'password'> = {
        id: 1,
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(result);

      expect(await userController.create(dto)).toEqual(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if user already exists', async (): Promise<void> => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(new ConflictException('Error'));

      await expect(userController.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('get', (): void => {
    it('should return an array of users without passwords', async (): Promise<void> => {
      const userParams: Partial<UserDto> = { email: 'test@example.com' };
      const result: Omit<UserDto, 'password'>[] = [
        {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.get.mockResolvedValue(result);

      expect(await userController.get(userParams)).toEqual(result);
    });
  });

  describe('getMe', (): void => {
    it('should return the current user without password', async (): Promise<void> => {
      const mockRequest = {
        user: { id: 1 },
      };

      const result: Omit<UserDto, 'password'> = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.getById.mockResolvedValue(result);

      expect(await userController.getMe(mockRequest as any)).toEqual(result);
      expect(mockUsersService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('getById', (): void => {
    it('should return a user by id without password', async (): Promise<void> => {
      const id = 1;
      const result: Omit<UserDto, 'password'> = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.getById.mockResolvedValue(result);

      expect(await userController.getById(id)).toEqual(result);
    });

    it('should return a message if user not found', async (): Promise<void> => {
      const id = 1;

      mockUsersService.getById.mockResolvedValue(null);

      expect(await userController.getById(id)).toEqual({
        message: 'User not found',
      });
    });
  });

  describe('update', (): void => {
    it('should update a user and return the updated user without password', async (): Promise<void> => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const result: Omit<UserDto, 'password'> = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(result);

      expect(await userController.update(id, updateUserDto)).toEqual(result);
    });
  });

  describe('remove', (): void => {
    it('should remove a user and return the removed user', async (): Promise<void> => {
      const id = 1;
      const result: Omit<UserDto, 'password'> = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.remove.mockResolvedValue(result);

      expect(await userController.remove(id)).toEqual(result);
    });
  });
});
