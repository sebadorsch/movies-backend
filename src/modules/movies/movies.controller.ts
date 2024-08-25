import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/guards/roles';
import { MovieDto } from './dto/movie-dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Movies')
@UseGuards(AuthGuard, RolesGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() createMovieDto: CreateMovieDto): Promise<MovieDto> {
    try {
      return this.moviesService.create(createMovieDto);
    } catch (e) {
      return null;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async get(@Body() movieParams: Partial<MovieDto>): Promise<MovieDto[]> {
    return this.moviesService.get(movieParams);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getBtId(@Param('id') id: number): Promise<MovieDto> {
    return this.moviesService.getById(+id);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<MovieDto> {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MovieDto> {
    return this.moviesService.remove(+id);
  }
}
