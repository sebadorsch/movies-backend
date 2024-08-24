import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as utils from '../../utils/utils';

describe('AuthService', (): void => {
  let authService: AuthService;
  let usersService: UsersService;

  const mockCreatedUser = {
    id: 1,
    email: 'test@test.com',
    password: 'password',
  };

  enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
  }

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: 'password',
    firstName: 'first name',
    lastName: 'last name',
    role: Role.USER,
    createdAt: new Date('2024-08-24T17:59:48.623Z'),
    updatedAt: new Date('2024-08-24T17:59:48.623Z'),
  };

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getByEmail: jest.fn(),
            create: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', (): void => {
    it('should fail when passwords are different', async (): Promise<void> => {
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser]);

      const result = await authService.validateUser(
        mockCreatedUser.email,
        'different password',
      );

      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      expect(result).toEqual(null);
    });

    it('should find the user and validate it', async (): Promise<void> => {
      mockUser.password = await bcrypt.hash(mockUser.password, 10);

      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser]);

      const result = await authService.validateUser(
        mockCreatedUser.email,
        'password',
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('signUp', (): void => {
    it('should fail when email already exists', async (): Promise<void> => {
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser]);

      try {
        await authService.signUp(mockUser);
      } catch (e) {
        expect(e.status).toEqual(409);
        expect(e.response).toEqual({
          message: 'User already exists',
          error: 'Conflict',
          statusCode: 409,
        });
      }
    });

    it('should fail creating a new user', async (): Promise<void> => {
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([]);

      try {
        await authService.signUp(mockUser);
      } catch (e) {
        expect(e.status).toEqual(401);
        expect(e.response).toEqual({
          message: 'Unauthorized',
          statusCode: 401,
        });
      }
    });

    it('should create a new user and return it', async (): Promise<void> => {
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([]);
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(mockUser);

      const user = await authService.signUp(mockUser);

      expect(user).not.toHaveProperty('password');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('accessToken');
      expect(user).toHaveProperty('refreshToken');
    });
  });

  describe('signIn', (): void => {
    it("should fail when user doesn't exist", async (): Promise<void> => {
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser]);

      try {
        await authService.signIn(mockUser.email, mockUser.password);
      } catch (e) {
        expect(e.status).toEqual(401);
        expect(e.response).toEqual({
          message: 'Unauthorized',
          statusCode: 401,
        });
      }
    });

    it('should validate the user and return it with the token', async (): Promise<void> => {
      const mockUser2 = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash(mockUser.password, 10),
        firstName: 'first name',
        lastName: 'last name',
        role: Role.USER,
      };

      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser2]);

      const user = await authService.signIn(mockUser.email, mockUser.password);

      expect(user).not.toHaveProperty('password');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('accessToken');
      expect(user).toHaveProperty('refreshToken');
    });
  });
});
