import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appService = moduleFixture.get<AppService>(AppService);

    await app.init();
    appService.resetCounters();
  });

  it('GET / - should return hello message and server stats', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.body).toHaveProperty('message', 'Hello World 🌏!');
    expect(res.body).toHaveProperty('statistics');

    const stats = res.body.statistics;
    expect(stats).toMatchObject({
      totalRequests: 1,
      requestsPerMinute: 1,
      requestHistoryCount: 1,
    });

    expect(stats.serverUptime).toMatch(/\d+d \d+h \d+m \d+s/);
    expect(stats.currentServerTime).toBeDefined();
    expect(stats.averageRequestsPerMinute).toBeGreaterThanOrEqual(0);
  });

  it('GET / - multiple requests should increase counters', async () => {
    await request(app.getHttpServer()).get('/');
    await request(app.getHttpServer()).get('/');
    await request(app.getHttpServer()).get('/');

    const res = await request(app.getHttpServer()).get('/').expect(200);

    const stats = res.body.statistics;
    expect(stats.totalRequests).toBeGreaterThanOrEqual(4);
    expect(stats.requestHistoryCount).toBeGreaterThanOrEqual(4);
    expect(stats.requestsPerMinute).toBeGreaterThanOrEqual(1);
  });

  afterEach(async () => {
    await app.close();
  });
});
