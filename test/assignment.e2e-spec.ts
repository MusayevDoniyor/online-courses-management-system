import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

describe('Assignments E2E', () => {
  let app: INestApplication;
  let studentToken: string;
  let adminToken: string;
  let moduleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // register + login student
    const studentEmail = `student${Math.random()}@mail.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Stu',
      email: studentEmail,
      password: '1234Stu!',
      role: 'student',
    });

    const studentLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: studentEmail, password: '1234Stu!' });

    studentToken = studentLogin.body.access_token;

    // register + login admin
    const adminEmail = `admin${Math.random()}@mail.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Admin',
      email: adminEmail,
      password: 'Admin123!',
      role: 'admin',
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'Admin123!' });

    adminToken = adminLogin.body.access_token;

    // create course ➝ module
    const courseRes = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Course',
        teacherId: adminLogin.body.user.id,
        price: 0,
        category: ['test'],
        level: 'beginner',
      });

    const moduleRes = await request(app.getHttpServer())
      .post(`/modules/${courseRes.body.course.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Module X', description: 'Test' });

    moduleId = moduleRes.body.module.id;
  });

  it('should submit assignment as student', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assignments/${moduleId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ fileLink: 'http://my-file-link.com' });

    expect(res.status).toBe(201);
    expect(res.body.assignmentId).toBeDefined();
  });

  it("should return student's assignments", async () => {
    const res = await request(app.getHttpServer())
      .get('/assignments/my')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
