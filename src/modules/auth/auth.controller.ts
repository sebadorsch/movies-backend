import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(@Body() user: SignUpDto): Promise<TokenDto> {
    return this.authService.signUp(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() user: SignInDto): Promise<TokenDto> {
    return this.authService.signIn(user.email, user.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() refreshToken: RefreshTokenDto): Promise<TokenDto> {
    return this.authService.refreshToken(refreshToken);
  }
}
