import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovieDto } from './dto/movie-dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { getFilterParams } from '../../utils/utils';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger();

  constructor(private prisma: PrismaService) {}

  /**
   * Refresh the free deployed server
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshServer(): Promise<void> {
    try{
      const res = await axios.get('https://movies-backend-7q1f.onrender.com/')
      console.log('Refresh the free deployed server -> Status:', res?.status);
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Update Movies db from external API
   */
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron(): Promise<void> {
    try {
      const {
        data: { results },
      } = await axios.get(
        `${process.env.BASE_MOVIES_URL ?? 'https://swapi.dev/api'}/films`,
      );

      const existingMovies = await this.prisma.movie.findMany({
        where: {
          episode_id: {
            in: results.map(
              (movie: CreateMovieDto): number => movie.episode_id,
            ),
          },
        },
      });

      const existingIds = new Set(
        existingMovies.map((movie): number => movie.episode_id),
      );

      const moviesToCreate = results.filter(
        (movie: CreateMovieDto): boolean => !existingIds.has(movie.episode_id),
      );

      if (moviesToCreate.length > 0) {
        await this.prisma.movie.createMany({
          data: moviesToCreate,
        });
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Create a new Movie
   *
   * @param createMovieDto
   *
   * @returns Promise<MovieDto>
   */
  async create(createMovieDto: CreateMovieDto): Promise<MovieDto> {
    try {
      if ((await this.get({ episode_id: createMovieDto.episode_id })).length)
        throw new ConflictException(`Movie already exists`);

      return this.prisma.movie.create({ data: createMovieDto });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error creating movie',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Get all or filtered Movies
   *
   * @returns Promise<MovieDto[]>
   */
  async get(filterParams: Partial<MovieDto>): Promise<MovieDto[]> {
    try {
      const filters = getFilterParams(filterParams);

      return this.prisma.movie.findMany({
        where: filters,
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error getting movie',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Get a Movie by id
   *
   * @param id
   *
   * @returns Promise<MovieDto[]>
   */
  async getById(id: number): Promise<MovieDto> {
    try {
      return this.prisma.movie.findUnique({
        where: { id },
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error getting movie',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Update a Movie
   *
   * @param id
   * @param updateMovieDto
   *
   * @returns Promise<MovieDto[]>
   */
  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<MovieDto> {
    try {
      return await this.prisma.movie.update({
        where: {
          id,
        },
        data: {
          ...updateMovieDto,
          edited: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error updating movie',
        e.response?.statusCode ?? 409,
      );
    }
  }

  /**
   * Delete a Movie
   *
   * @param id
   *
   * @returns Promise<MovieDto>
   */
  async remove(id: number): Promise<MovieDto> {
    try {
      if (!(await this.prisma.movie.findUnique({ where: { id } })))
        throw new ConflictException(`Movie not Found`);

      return this.prisma.movie.delete({
        where: { id },
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        e.response?.message ?? 'Error deleting movie',
        e.response?.statusCode ?? 409,
      );
    }
  }
}
