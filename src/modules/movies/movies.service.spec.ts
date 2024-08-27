import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConflictException, HttpException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MoviesService', (): void => {
  let service: MoviesService;
  let prisma: PrismaService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService, PrismaService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });

  describe('handleCron', (): void => {
    it('should sync movies from external API', async (): Promise<void> => {
      const moviesMock = [
        { episode_id: 1, title: 'Movie 1' },
        { episode_id: 2, title: 'Movie 2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: { results: moviesMock } });

      prisma.movie.findMany = jest.fn().mockResolvedValue([{ episode_id: 1 }]);
      prisma.movie.createMany = jest.fn().mockResolvedValue({});

      await service.handleCron();

      expect(prisma.movie.findMany).toHaveBeenCalled();
      expect(prisma.movie.createMany).toHaveBeenCalledWith({
        data: [moviesMock[1]],
      });
    });

    it('should log an error if sync fails', async (): Promise<void> => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await service.handleCron();

      expect(loggerSpy).toHaveBeenCalledWith(new Error('API Error'));
    });
  });

  describe('create', (): void => {
    it('should create a movie', async (): Promise<void> => {
      const createMovieDto: CreateMovieDto = {
        title: 'Test Movie',
        director: 'Test Director',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1', 'Species 2'],
        starships: ['Starship 1', 'Starship 2'],
        vehicles: ['Vehicle 1', 'Vehicle 2'],
        characters: ['Character 1', 'Character 2'],
        planets: ['Planet 1', 'Planet 2'],
        url: 'https://example.com',
      };
      prisma.movie.create = jest.fn().mockResolvedValue(createMovieDto);
      prisma.movie.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.create(createMovieDto);

      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: createMovieDto,
      });
      expect(result).toEqual(createMovieDto);
    });

    it('should throw ConflictException if movie already exists', async (): Promise<void> => {
      const mockMovie = {
        id: 1,
        title: 'A New Hope',
        director: 'George Lucas',
        episode_id: 4,
        opening_crawl: 'It is a period of civil war...',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        species: ['Human', 'Droid'],
        starships: ['X-Wing', 'TIE Fighter'],
        vehicles: ['Snowspeeder', 'AT-AT'],
        characters: ['Luke Skywalker', 'Darth Vader'],
        planets: ['Tatooine', 'Alderaan'],
        url: 'https://swapi.dev/api/films/1/',
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'get').mockResolvedValue([mockMovie]);

      try {
        await service.create(mockMovie);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('Movie already exists');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('get', (): void => {
    it('should return movies based on filter parameters', async (): Promise<void> => {
      const moviesMock = [{ title: 'Movie 1' }, { title: 'Movie 2' }];
      prisma.movie.findMany = jest.fn().mockResolvedValue(moviesMock);

      const result = await service.get({ title: 'Movie 1' });

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { title: 'Movie 1' },
      });
      expect(result).toEqual(moviesMock);
    });

    it('should return an empty array if no movies match the filter', async (): Promise<void> => {
      prisma.movie.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.get({ title: 'Non-existent Movie' });

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { title: 'Non-existent Movie' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getById', (): void => {
    it('should return a movie by id', async (): Promise<void> => {
      const movieMock = { id: 1, title: 'Movie 1' };
      prisma.movie.findUnique = jest.fn().mockResolvedValue(movieMock);

      const result = await service.getById(1);

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(movieMock);
    });

    it('should throw an exception if no movie is found by id', async (): Promise<void> => {
      prisma.movie.findUnique = jest.fn().mockResolvedValue(null);

      try {
        await service.getById(999);
      } catch (e) {
        expect(prisma.movie.findUnique).toHaveBeenCalledWith({
          where: { id: 999 },
        });
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('Error getting movie');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('update', (): void => {
    it('should update a movie', async (): Promise<void> => {
      const updateMovieDto = { title: 'Updated Movie' };
      const movieMock = { id: 1, title: 'Updated Movie' };

      prisma.movie.update = jest.fn().mockResolvedValue(movieMock);

      const result = await service.update(1, updateMovieDto);

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...updateMovieDto,
          edited: expect.any(Date),
        },
      });
      expect(result).toEqual(movieMock);
    });

    it('should throw an exception if movie update fails', async (): Promise<void> => {
      prisma.movie.update = jest
        .fn()
        .mockRejectedValue(new Error('Update failed'));

      try {
        await service.update(999, { title: 'New Title' });
      } catch (e) {
        expect(prisma.movie.update).toHaveBeenCalledWith({
          where: { id: 999 },
          data: {
            title: 'New Title',
            edited: expect.any(Date),
          },
        });
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('Error updating movie');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('remove', (): void => {
    it('should delete a movie by id', async (): Promise<void> => {
      const movieMock = { id: 1, title: 'Movie 1' };

      prisma.movie.findUnique = jest.fn().mockResolvedValue(movieMock);

      prisma.movie.delete = jest.fn().mockResolvedValue(movieMock);

      const result = await service.remove(1);

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(movieMock);
    });

    it('should throw an exception if no movie is found to delete', async (): Promise<void> => {
      prisma.movie.delete = jest
        .fn()
        .mockRejectedValue(new Error('Movie not found'));

      try {
        await service.remove(999);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toBe('Movie not Found');
        expect(e.status).toBe(409);
      }
    });
  });
});
