import { ConfigService } from '@nestjs/config';

export const getConfig = (configService: ConfigService) => ({
  jwtSecret: configService.get<string>('JWT_SECRET'),
  dbUrl: configService.get<string>('DATABASE_URL'),
  jwtExpirationTime: configService.get<string>('JWT_EXPIRATION_TIME'),
});
