import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EnrollmentsController } from '../src/enrollments/enrollments.controller';
import { EnrollmentsService } from '../src/enrollments/enrollments.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';

describe('EnrollmentsController (mocked)', () => {
  let app: INestApplication;

  const mockUuid = 'cf9c92f2-2a2f-4ef9-8a89-e0200c6c4a2a';

  const studentUser = {
    id: mockUuid,
    email: 'student@test.com',
    role: 'student',
  };

  const enrollmentsService = {
    enroll: jest.fn(),
    completeLesson: jest.fn(),
    getProgress: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: enrollmentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = studentUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('POST /enrollments - should enroll successfully', async () => {
    enrollmentsService.enroll.mockResolvedValue({
      message: 'Enrollment successful',
      enrollment: {
        id: mockUuid,
        courseId: mockUuid,
      },
    });

    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .send({ courseId: mockUuid });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Enrollment successful');
    expect(res.body.enrollment.courseId).toBe(mockUuid);
  });

  it('POST /enrollments/complete - should mark lesson as completed', async () => {
    enrollmentsService.completeLesson.mockResolvedValue({
      message: 'Lesson marked as completed',
    });

    const res = await request(app.getHttpServer())
      .post('/enrollments/complete')
      .send({ lessonId: mockUuid });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Lesson marked as completed');
  });

  it('GET /enrollments/progress - should return enrollment progress', async () => {
    enrollmentsService.getProgress.mockResolvedValue({
      message: 'Your enrollments and progress',
      enrollments: [
        {
          id: mockUuid,
          course: {
            id: mockUuid,
            name: 'Mock Course',
          },
          completedLessons: [],
        },
      ],
    });

    const res = await request(app.getHttpServer()).get('/enrollments/progress');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Your enrollments and progress');
    expect(res.body.enrollments).toHaveLength(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
