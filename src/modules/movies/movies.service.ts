import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, MovieDto, UpdateMovieDto } from './dto/movie-dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { getFilterParams } from '../../utils/utils';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update Movies db from external API
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    try {
      console.log('Cron scheduled every 10 minutes: synchronizing movies');

      const {
        data: { results },
      } = await axios.get(`${process.env.BASE_MOVIES_URL}/films`);

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
      return this.prisma.movie.create({ data: createMovieDto });
    } catch (e) {
      return null;
    }
  }

  /**
   * Get all or filtered Movies
   *
   * @returns Promise<MovieDto[]>
   */
  async get(filterParams: Partial<MovieDto>): Promise<MovieDto[]> {
    const filters = getFilterParams(filterParams);

    return this.prisma.movie.findMany({
      where: filters,
    });
  }

  /**
   * Get a Movie by id
   *
   * @param id
   *
   * @returns Promise<MovieDto[]>
   */
  async getById(id: number): Promise<MovieDto> {
    return this.prisma.movie.findUnique({
      where: { id },
    });
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
        },
      });
    } catch (e) {
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
    return this.prisma.movie.delete({
      where: { id },
    });
  }
}
