import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Enrollments E2E', () => {
  let app: INestApplication;
  let studentToken: string;
  let adminToken: string;
  let dataSource: DataSource;
  let courseId: string;
  let lessonId: string;
  let adminId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleRef.get(DataSource);

    const adminEmail = `admin${Math.floor(Math.random() * 1000)}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Admin User',
      email: adminEmail,
      password: 'Admin123!',
      role: 'admin',
    });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: 'Admin123!',
      });
    adminToken = adminLoginRes.body.access_token;

    adminId = adminLoginRes.body.user.id || adminLoginRes.body.id;

    const studentEmail = `student${Math.floor(Math.random() * 1000)}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Test Student',
      email: studentEmail,
      password: 'Student123!',
      role: 'student',
    });

    const studentLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: studentEmail,
        password: 'Student123!',
      });
    studentToken = studentLoginRes.body.access_token;

    const courseRes = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Course',
        price: 0,
        category: ['test'],
        teacherId: adminId,
        level: 'beginner',
      });
    courseId = courseRes.body.course.id;

    const moduleRes = await request(app.getHttpServer())
      .post(`/modules/${courseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Module',
        description: 'Test module description',
      });
    const moduleId = moduleRes.body.module.id;

    const lessonRes = await request(app.getHttpServer())
      .post(`/lessons/${moduleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Lesson',
        content: 'Test lesson content',
      });
    lessonId = lessonRes.body.lesson.id;
  });

  it('POST /enrollments - should enroll in a course', async () => {
    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Enrollment successful');
    expect(res.body.enrollment).toBeDefined();
  });

  it('POST /enrollments/complete - should complete a lesson', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId });

    const res = await request(app.getHttpServer())
      .post('/enrollments/complete')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ lessonId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Lesson marked as completed');
  });

  it('GET /enrollments/progress - should get enrollment progress', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId });

    const res = await request(app.getHttpServer())
      .get('/enrollments/progress')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Your enrollments and progress');
    expect(res.body.enrollments).toBeInstanceOf(Array);
  });

  it('POST /enrollments - should not allow duplicate enrollment', async () => {
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId });

    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Already enrolled in this course');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
