import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Courses E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let dataSource: DataSource;
  let registerRes: request.Response;

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

    registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin User',
        email: `admin${Math.round(Math.random() * 1000)}@example.com`,
        password: '/123!Admin',
        role: 'admin',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerRes.body.user.email,
        password: '/123!Admin',
      });

    accessToken = loginRes.body.access_token;
  });

  let courseId: string;

  it('POST /courses - should create a course', async () => {
    expect(registerRes.body.user).toBeDefined();

    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'NestJS Course',
        price: 50000,
        category: ['backend'],
        teacherId: registerRes.body.user.id,
        level: 'beginner',
      });

    expect(res.status).toBe(201);
    expect(res.body.course).toHaveProperty('id');
    courseId = res.body.course.id;
  });

  it('GET /courses - should return list of courses', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThan(0);
  });

  it('GET /courses/:id - should return specific course', async () => {
    const res = await request(app.getHttpServer())
      .get(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.course.id).toBe(courseId);
  });

  it('PUT /courses/:id - should update course', async () => {
    const res = await request(app.getHttpServer())
      .put(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated NestJS Course' });

    expect(res.status).toBe(200);
    expect(res.body.course.name).toBe('Updated NestJS Course');
  });

  it('DELETE /courses/:id - should delete course', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Course deleted successfully');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
