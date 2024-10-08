import {
  Body,
  CallHandler,
  ConflictException,
  Controller,
  Delete,
  ExecutionContext,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  NestInterceptor,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { map, Observable } from 'rxjs';
import * as _ from 'lodash';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/guards/roles';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

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

@ApiTags('Users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ExcludePasswordInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<UserDto, 'password'>> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (e) {
      throw new ConflictException(`Error`);
    }
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async get(
    @Query() userParams: Partial<UserDto>,
    //ToDo:
    // @Query('orderBy') orderBy?: keyof UserDto,
    // @Query('orderDirection') orderDirection: 'asc' | 'desc' = 'asc',
  ): Promise<Omit<UserDto, 'password'>[]> {
    return (await this.usersService.get(userParams)) ?? [];
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Req() request: Request): Promise<Omit<UserDto, 'password'>> {
    const { id } = request['user'];

    return await this.usersService.getById(+id);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<UserDto, 'password'> | { message: string }> {
    const user = await this.usersService.getById(id);

    if (_.isEmpty(user)) return { message: 'User not found' };

    return user;
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserDto, 'password'>> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.remove(+id);
  }
}
