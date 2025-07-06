import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './../src/auth/auth.controller';
import { AuthService } from './../src/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';

describe('AuthController (e2e) — pure mock', () => {
  let app: INestApplication;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    refresh: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
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

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /auth/register', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'Test1234!',
    };

    mockAuthService.register.mockResolvedValue({
      message: 'User registered successfully',
      user: { id: '1', name: dto.name, email: dto.email, role: 'student' },
    });

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body.user.email).toBe(dto.email);
      });
  });

  it('POST /auth/login', async () => {
    const dto = { email: 'test@example.com', password: 'Test1234!' };

    mockAuthService.login.mockResolvedValue({
      message: 'User logged in successfully',
      access_token: 'mocked-jwt',
      user: { name: 'Test User', email: dto.email, role: 'student' },
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

  it('GET /auth/profile', async () => {
    mockAuthService.getProfile.mockResolvedValue({
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

  it('POST /auth/refresh', async () => {
    const newToken = 'new-access-token';

    mockAuthService.refresh.mockImplementation((req, res) => {
      res.cookie('access_token', newToken);
      return { access_token: newToken };
    });

    return request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(201)
      .expect('set-cookie', /access_token=new-access-token/)
      .expect((res) => {
        expect(res.body.access_token).toBe(newToken);
      });
  });

  it('POST /auth/logout', async () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .expect(201)
      .expect((res) => {
        const cookies = res.headers['set-cookie'];
        expect(cookies).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/access_token=;/),
            expect.stringMatching(/refresh_token=;/),
          ]),
        );
        expect(res.body.message).toBe('Logged out successfully');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
