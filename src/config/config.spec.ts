import { ConfigService } from '@nestjs/config';
import { getConfig } from './config';

describe('getConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  it('should return correct configuration values', () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'testSecret';
        case 'DATABASE_URL':
          return 'testDbUrl';
        case 'JWT_EXPIRATION_TIME':
          return '2d';
        default:
          return undefined;
      }
    });

    const config = getConfig(configService);

    expect(config.jwtSecret).toBe('testSecret');
    expect(config.dbUrl).toBe('testDbUrl');
    expect(config.jwtExpirationTime).toBe('2d');
  });

  it('should use default expiration time if not provided', () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'testSecret';
        case 'DATABASE_URL':
          return 'testDbUrl';
        default:
          return undefined;
      }
    });

    const config = getConfig(configService);

    expect(config.jwtExpirationTime).toBe('1d');
  });
});
