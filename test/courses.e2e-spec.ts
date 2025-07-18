import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CourseController } from '../src/course/course.controller';
import { CourseService } from '../src/course/course.service';
import { JwtAuthGuard } from '../src/common/guards/auth.guard';

describe('CoursesController (E2E - pure mock)', () => {
  let app: INestApplication;

  const courseService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'mock-user-id',
    email: 'admin@test.com',
    role: 'admin',
  };

  const mockCourseId = 'mock-course-id';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: courseService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /courses - should create a course', async () => {
    const dto = {
      name: 'Mocked NestJS Course',
      price: 100000,
      category: ['backend'],
      level: 'beginner',
    };

    const mockResponse = {
      id: mockCourseId,
      ...dto,
    };

    courseService.create.mockResolvedValue({
      message: 'Course created successfully',
      course: mockResponse,
    });

    const res = await request(app.getHttpServer())
      .post('/courses')
      .send(dto)
      .expect(201);

    expect(res.body.course.name).toBe(dto.name);
  });

  it('GET /courses - should return list of courses', async () => {
    const mockCourses = [
      {
        id: mockCourseId,
        name: 'Mocked NestJS Course',
        price: 100000,
        category: ['backend'],
        level: 'beginner',
        teacherId: mockUser.id,
      },
    ];

    courseService.findAll.mockResolvedValue({
      message: 'Courses found successfully',
      count: 1,
      courses: mockCourses,
    });

    const res = await request(app.getHttpServer()).get('/courses').expect(200);

    expect(res.body.count).toBe(1);
  });

  it('GET /courses/:id - should return one course', async () => {
    const mockCourse = {
      id: mockCourseId,
      name: 'Mocked NestJS Course',
    };

    courseService.findOne.mockResolvedValue({
      message: 'Course found',
      course: mockCourse,
    });

    const res = await request(app.getHttpServer())
      .get(`/courses/${mockCourseId}`)
      .expect(200);

    expect(res.body.course.id).toBe(mockCourseId);
  });

  it('PUT /courses/:id - should update a course', async () => {
    const updateDto = {
      name: 'Updated Mock Course',
    };

    const updatedCourse = {
      id: mockCourseId,
      ...updateDto,
    };

    courseService.update.mockResolvedValue({
      message: 'Course updated successfully',
      course: updatedCourse,
    });

    const res = await request(app.getHttpServer())
      .put(`/courses/${mockCourseId}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.course.name).toBe(updateDto.name);
  });

  it('DELETE /courses/:id - should delete course', async () => {
    courseService.remove.mockResolvedValue({
      message: 'Course deleted successfully',
    });

    const res = await request(app.getHttpServer())
      .delete(`/courses/${mockCourseId}`)
      .expect(200);

    expect(res.body.message).toBe('Course deleted successfully');
  });

  afterAll(async () => {
    await app.close();
  });
});
