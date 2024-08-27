import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenDto } from './dto/token.dto';

describe('AuthController', (): void => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  describe('signUp', (): void => {
    it('should return a TokenDto after successful sign-up', async (): Promise<void> => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };

      const tokenDto: TokenDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(tokenDto);

      const result = await authController.signUp(signUpDto);

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(tokenDto);
    });
  });

  describe('signIn', (): void => {
    it('should return a TokenDto after successful sign-in', async (): Promise<void> => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const tokenDto: TokenDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(tokenDto);

      const result = await authController.signIn(signInDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(result).toEqual(tokenDto);
    });
  });

  describe('refreshToken', (): void => {
    it('should return a new TokenDto after refreshing the token', async (): Promise<void> => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const tokenDto: TokenDto = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(tokenDto);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(tokenDto);
    });
  });
});
