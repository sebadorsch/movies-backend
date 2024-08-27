import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDto } from './dto/movie-dto';

describe('MoviesController', (): void => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create a new movie', async (): Promise<void> => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        director: 'Director Name',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1'],
        starships: ['Starship 1'],
        vehicles: ['Vehicle 1'],
        characters: ['Character 1'],
        planets: ['Planet 1'],
        url: 'https://example.com',
      };

      const movieDto: MovieDto = {
        id: 1,
        title: 'New Movie',
        director: 'Director Name',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1'],
        starships: ['Starship 1'],
        vehicles: ['Vehicle 1'],
        characters: ['Character 1'],
        planets: ['Planet 1'],
        url: 'https://example.com',
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(movieDto);

      const result = await controller.create(createMovieDto);

      expect(result).toEqual(movieDto);
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('get', (): void => {
    it('should return a list of movies', async (): Promise<void> => {
      const movieParams: Partial<MovieDto> = { title: 'New Movie' };
      const moviesDto: MovieDto[] = [
        {
          id: 1,
          title: 'New Movie',
          director: 'Director Name',
          episode_id: 1,
          opening_crawl: 'Opening crawl text',
          producer: 'Producer Name',
          release_date: '2024-01-01',
          species: ['Species 1'],
          starships: ['Starship 1'],
          vehicles: ['Vehicle 1'],
          characters: ['Character 1'],
          planets: ['Planet 1'],
          url: 'https://example.com',
          created: new Date(),
          edited: new Date(),
        },
      ];

      jest.spyOn(service, 'get').mockResolvedValue(moviesDto);

      const result = await controller.get(movieParams);

      expect(result).toEqual(moviesDto);
      expect(service.get).toHaveBeenCalledWith(movieParams);
    });
  });

  describe('getById', (): void => {
    it('should return a movie by ID', async (): Promise<void> => {
      const id = 1;
      const movieDto: MovieDto = {
        id: 1,
        title: 'New Movie',
        director: 'Director Name',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1'],
        starships: ['Starship 1'],
        vehicles: ['Vehicle 1'],
        characters: ['Character 1'],
        planets: ['Planet 1'],
        url: 'https://example.com',
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'getById').mockResolvedValue(movieDto);

      const result = await controller.getBtId(id);

      expect(result).toEqual(movieDto);
      expect(service.getById).toHaveBeenCalledWith(id);
    });

    it('should return a message if movie not found', async (): Promise<void> => {
      const id = 1;

      jest.spyOn(service, 'getById').mockResolvedValue(null);

      const result = await controller.getBtId(id);

      expect(result).toEqual({ message: 'movie not found' });
      expect(service.getById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', (): void => {
    it('should update a movie and return the updated movie', async (): Promise<void> => {
      const id = 1;
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };

      const movieDto: MovieDto = {
        id: 1,
        title: 'Updated Movie',
        director: 'Director Name',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1'],
        starships: ['Starship 1'],
        vehicles: ['Vehicle 1'],
        characters: ['Character 1'],
        planets: ['Planet 1'],
        url: 'https://example.com',
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(movieDto);

      const result = await controller.update(id, updateMovieDto);

      expect(result).toEqual(movieDto);
      expect(service.update).toHaveBeenCalledWith(id, updateMovieDto);
    });
  });

  describe('remove', (): void => {
    it('should remove a movie and return the removed movie', async (): Promise<void> => {
      const id = 1;
      const movieDto: MovieDto = {
        id: 1,
        title: 'Removed Movie',
        director: 'Director Name',
        episode_id: 1,
        opening_crawl: 'Opening crawl text',
        producer: 'Producer Name',
        release_date: '2024-01-01',
        species: ['Species 1'],
        starships: ['Starship 1'],
        vehicles: ['Vehicle 1'],
        characters: ['Character 1'],
        planets: ['Planet 1'],
        url: 'https://example.com',
        created: new Date(),
        edited: new Date(),
      };

      jest.spyOn(service, 'remove').mockResolvedValue(movieDto);

      const result = await controller.remove(id);

      expect(result).toEqual(movieDto);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
