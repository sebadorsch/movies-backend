import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', (): void => {
  let controller: AuthController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    jest.resetAllMocks();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
