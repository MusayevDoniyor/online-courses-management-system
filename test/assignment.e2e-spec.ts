import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AssignmentsController } from '../src/assignments/assignments.controller';
import { AssignmentsService } from '../src/assignments/assignments.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';

describe('AssignmentsController (mocked E2E)', () => {
  let app: INestApplication;

  const mockStudent = {
    id: 'student-123',
    email: 'student@test.com',
    role: 'student',
  };

  const assignmentService = {
    submitAssignment: jest.fn(),
    getStudentAssignments: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: assignmentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockStudent;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('POST /assignments/:lessonId - should submit assignment (mocked)', async () => {
    const lessonId = 'cf9c92f2-2a2f-4ef9-8a89-e0200c6c484e';

    assignmentService.submitAssignment.mockResolvedValue({
      message: 'Assignment submitted successfully',
      assignmentId: 'cf9c92f2-2a2f-4ef9-8a89-e0200c6c4841',
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${lessonId}`)
      .send({ fileLink: 'https://example.com/assignment.docx' });

    expect(res.status).toBe(201);
    expect(res.body.assignmentId).toBe('cf9c92f2-2a2f-4ef9-8a89-e0200c6c4841');
  });

  it('GET /assignments/my - should return student assignments (mocked)', async () => {
    assignmentService.getStudentAssignments.mockResolvedValue([
      {
        id: 'a1',
        fileLink: 'https://example.com',
        submittedAt: new Date(),
        lesson: { id: 'lesson-123', title: 'Lesson X' },
      },
    ]);

    const res = await request(app.getHttpServer())
      .get('/assignments/my')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].lesson.title).toBe('Lesson X');
  });

  afterAll(async () => {
    await app.close();
  });
});
