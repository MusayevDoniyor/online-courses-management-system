import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';

describe('AuthController (e2e) with mocks', () => {
  let app: INestApplication;
  let authService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'mocked-id',
            email: 'test@code.com',
            role: 'student',
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /auth/register - success', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Securepass123!',
    };

    authService.register.mockResolvedValue({
      message: 'User registered successfully',
      user: {
        id: '1',
        name: dto.name,
        email: dto.email,
        role: 'student',
      },
    });

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body.user.email).toBe(dto.email);
        expect(res.body.message).toBe('User registered successfully');
      });
  });

  it('POST /auth/login - success with cookie', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Securepass123!',
    };

    authService.login.mockResolvedValue({
      message: 'User logged in successfully',
      access_token: 'mocked-jwt',
      user: {
        // id: '1',
        name: 'Test User',
        email: dto.email,
        role: 'student',
      },
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(201)
      .expect('set-cookie', /access_token=mocked-jwt/)
      .expect((res) => {
        expect(res.body.access_token).toBe('mocked-jwt');
      });
  });

  it('GET /auth/profile - with JwtAuthGuard mocked', async () => {
    authService.getProfile.mockResolvedValue({
      id: 'mocked-id',
      email: 'test@code.com',
      name: 'Doniyor',
      role: 'student',
      created_at: new Date(),
    });

    return request(app.getHttpServer())
      .get('/auth/profile')
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('test@code.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
