import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.model';
import { map, Observable } from 'rxjs';
import * as _ from 'lodash';
import { GeneralMessageResponseDto } from './dto/general-message-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/guards/roles';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map(({ password, ...result }) => result);
        } else {
          if (!!data?.password) {
            const { password, ...result } = data;
            return result;
          }
          return data;
        }
      }),
    );
  }
}

@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ExcludePasswordInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post()
  async set(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return await this.usersService.create(createUserDto);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAll(): Promise<Omit<User, 'password'>[]> {
    return (await this.usersService.getAll()) ?? [];
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(
    @Param('id') id: string,
  ): Promise<Omit<User, 'password'> | GeneralMessageResponseDto> {
    const user = await this.usersService.getById(+id);

    if (_.isEmpty(user)) return { message: 'User not found' };

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.usersService.remove(+id);
  }
}
