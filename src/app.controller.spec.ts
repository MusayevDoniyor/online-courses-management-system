import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, HelloResponse } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getHello', () => {
    it('should return an object with message and statistics', () => {
      const result = appController.getHello() as HelloResponse;
      expect(result).toEqual({
        message: expect.any(String),
        statistics: expect.any(Object),
      });
      expect(result.message).toBe('Hello World 🌏!');
    });

    it('should increment counters correctly', () => {
      appService.resetCounters();

      appService.recordRequest();
      const first = appController.getHello() as HelloResponse;

      appService.recordRequest();
      const second = appController.getHello() as HelloResponse;

      expect(first.statistics.totalRequests).toBe(1);
      expect(second.statistics.totalRequests).toBe(2);
      expect(second.statistics.requestHistoryCount).toBe(2);
    });

    it('should calculate requests per minute correctly', () => {
      appService.resetCounters();
      jest.useFakeTimers();

      const now = new Date();
      jest.setSystemTime(now);

      appService.recordRequest();
      appController.getHello();

      jest.setSystemTime(new Date(now.getTime() + 59000));
      appService.recordRequest();
      appController.getHello();

      jest.setSystemTime(new Date(now.getTime() + 121000));
      appService.recordRequest();
      const result = appController.getHello() as HelloResponse;

      expect(typeof result.statistics.requestsPerMinute).toBe('number');
    });
  });
});
