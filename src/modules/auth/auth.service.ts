import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TokenDto } from './dto/token.dto';
import { hashPassword } from '../../utils/utils';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UserDto } from '../users/dto/user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user in db with email and password
   *
   * @param email
   * @param password
   *
   * @returns Promise<UserDto>
   */
  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user: UserDto = (await this.usersService.get({ email }))[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  /**
   * Register user and sign JWT token
   *
   * @param user
   *
   * @returns Promise<SignInDto>
   */
  async signUp(user: CreateUserDto): Promise<TokenDto> {
    if (await this.usersService.get({ email: user.email }))
      throw new ConflictException(`User already exists`);

    try {
      user.password = await hashPassword(user.password);

      const createdUser = await this.usersService.create(user);
      const { password, ...payload } = createdUser;

      return {
        ...payload,
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
        }),
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Validate user and sign JWT token
   *
   * @param email
   * @param pwd
   *
   * @returns Promise<SignInDto>
   */
  async signIn(email: string, pwd: string): Promise<TokenDto> {
    const validatedUser = await this.validateUser(email, pwd);

    if (!validatedUser) throw new UnauthorizedException();

    const { password, ...payload } = validatedUser;

    try {
      return {
        ...payload,
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
        }),
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Refresh JWT token
   *
   * @param refreshTokenDto
   *
   * @returns Promise<SignInDto>
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenDto> {
    try {
      const { refreshToken } = refreshTokenDto;

      const decodedToken = await this.jwtService.verifyAsync(refreshToken);

      const user = (
        await this.usersService.get({ email: decodedToken.email })
      )[0];

      if (!user)
        throw new UnauthorizedException('Invalid or expired refresh token');

      const { password, ...payload } = user;

      return {
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
        }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
