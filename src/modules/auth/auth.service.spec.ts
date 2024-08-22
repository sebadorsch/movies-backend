import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

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
      jest.spyOn(usersService, 'getByEmail').mockResolvedValueOnce(mockUser);

      const result = await authService.validateUser(
        mockCreatedUser.email,
        'different password',
      );

      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      expect(result).toEqual(null);
    });

    it('should find the user and validate it', async (): Promise<void> => {
      mockUser.password = await bcrypt.hash(mockUser.password, 10);

      jest.spyOn(usersService, 'getByEmail').mockResolvedValueOnce(mockUser);

      const result = await authService.validateUser(
        mockCreatedUser.email,
        'password',
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('signUp', (): void => {
    it('should fail when email already exists', async (): Promise<void> => {
      jest.spyOn(usersService, 'getByEmail').mockResolvedValueOnce(mockUser);

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
  });
});
