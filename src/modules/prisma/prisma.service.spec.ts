import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      const connectSpy = jest.spyOn(prismaService, '$connect');

      await prismaService.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });
});
