import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Request } from 'express';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: EnrollmentsService;

  const mockEnrollmentsService = {
    enroll: jest.fn().mockResolvedValue({ message: 'Enrollment successful' }),
    completeLesson: jest
      .fn()
      .mockResolvedValue({ message: 'Lesson marked as completed' }),
    getProgress: jest.fn().mockResolvedValue({
      message: 'Your enrollments and progress',
      enrollments: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('enroll', () => {
    it('should enroll a student in a course', async () => {
      const req = { user: { id: 'user1' } } as unknown as Request;
      const dto = { courseId: 'course1' };

      const res = await controller.enroll(req, dto);
      expect(res.message).toBe('Enrollment successful');
      expect(service.enroll).toHaveBeenCalledWith('user1', 'course1');
    });
  });

  describe('completeLesson', () => {
    it('should mark a lesson as completed', async () => {
      const req = { user: { id: 'user1' } } as unknown as Request;
      const dto = { lessonId: 'lesson1' };

      const res = await controller.completeLesson(req, dto);
      expect(res.message).toBe('Lesson marked as completed');
      expect(service.completeLesson).toHaveBeenCalledWith('user1', 'lesson1');
    });
  });

  describe('getProgress', () => {
    it('should return enrollments and progress', async () => {
      const req = { user: { id: 'user1' } } as unknown as Request;

      const res = await controller.getProgress(req);
      expect(res.message).toBe('Your enrollments and progress');
      expect(service.getProgress).toHaveBeenCalledWith('user1');
    });
  });
});
