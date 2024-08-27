import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UnauthorizedException } from '@nestjs/common';
import { TokenDto } from './dto/token.dto';
import { UserDto } from '../users/dto/user.dto';

describe('AuthService', (): void => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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

  const mockJwtService = () => ({
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  });

  const mockUsersService = () => ({
    get: jest.fn(),
    create: jest.fn(),
  });

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useFactory: mockJwtService },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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

  describe('refreshToken', (): void => {
    it('should refresh the token', async (): Promise<void> => {
      const mockDecodedToken = {
        id: 1,
        email: 'admin@test.com',
        role: 'ADMIN',
        firstName: 'first',
        lastName: 'last',
        iat: 1724612856,
        exp: 1724699256,
      };

      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const mockUser: UserDto = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashed_password',
        role: 'ADMIN',
        firstName: 'first',
        lastName: 'last',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTokenDto: TokenDto = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockDecodedToken);
      jest.spyOn(usersService, 'get').mockResolvedValueOnce([mockUser]);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(mockTokenDto.accessToken)
        .mockResolvedValueOnce(mockTokenDto.refreshToken);

      const result = await authService.refreshToken(refreshTokenDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        }),
        { expiresIn: '1d' }
      );

      expect(result).toEqual(mockTokenDto);
    });

    it('Should fail verifying the token', async (): Promise<void> => {
      const refreshToken = {
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImZpcnN0TmFtZSI6InNlYmEiLCJsYXN0TmFtZSI6ImRvcnNjaCIsImNyZWF0ZWQiOiIyMDI0LTA4LTI1VDAzOjQ2OjQyLjM2OVoiLCJlZGl0ZWQiOiIyMDI0LTA4LTI1VDA0OjU5OjQzLjIzMFoiLCJpYXQiOjE3MjQ2MTI4NTYsImV4cCI6MTcyNDY5OTI1Nn0.fUuaMSTy9vE37VKevaIEFQnE8enmmfm6PfpKFBW7KmA',
      };

      try {
        await authService.refreshToken(refreshToken);
      } catch (e) {
        expect(e.status).toEqual(401);
        expect(e.response).toEqual({
          message: 'Invalid or expired refresh token',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }
    });

    it('should throw UnauthorizedException if user is not found', async (): Promise<void> => {
      const refreshToken: RefreshTokenDto = {
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImZpcnN0TmFtZSI6InNlYmEiLCJsYXN0TmFtZSI6ImRvcnNjaCIsImNyZWF0ZWQiOiIyMDI0LTA4LTI1VDAzOjQ2OjQyLjM2OVoiLCJlZGl0ZWQiOiIyMDI0LTA4LTI1VDA0OjU5OjQzLjIzMFoiLCJpYXQiOjE3MjQ2MTI4NTYsImV4cCI6MTcyNDY5OTI1Nn0.fUuaMSTy9vE37VKevaIEFQnE8enmmfm6PfpKFBW7KmA',
      };
      const decodedToken = { email: 'test@example.com' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(decodedToken);
      usersService.get = jest.fn().mockResolvedValue([]);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
