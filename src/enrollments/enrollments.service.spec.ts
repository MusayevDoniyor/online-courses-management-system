import { Test } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrollment } from '../common/entities/enrollment.entity';
import { Course } from '../common/entities/course.entity';
import { User } from '../common/entities/user.entity';
import { Lesson } from '../common/entities/lesson.entity';
import { Repository } from 'typeorm';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let enrollmentRepo: Repository<Enrollment>;
  let userRepo: Repository<User>;
  let courseRepo: Repository<Course>;
  let lessonRepo: Repository<Lesson>;
  let managerMock: any;

  beforeEach(async () => {
    managerMock = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const enrollmentRepoMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      manager: managerMock,
    };
    const userRepoMock = {
      findOne: jest.fn(),
    };

    const courseRepoMock = {
      findOne: jest.fn(),
    };

    const lessonRepoMock = {
      findOneBy: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: enrollmentRepoMock,
        },
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: getRepositoryToken(Course), useValue: courseRepoMock },
        { provide: getRepositoryToken(Lesson), useValue: lessonRepoMock },
      ],
    }).compile();

    service = module.get(EnrollmentsService);
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    userRepo = module.get(getRepositoryToken(User));
    courseRepo = module.get(getRepositoryToken(Course));
    lessonRepo = module.get(getRepositoryToken(Lesson));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enroll user to a course', async () => {
    const user = { id: 'u1' } as User;
    const course = { id: 'c1' } as Course;

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(courseRepo, 'findOne').mockResolvedValue(course);
    jest.spyOn(enrollmentRepo, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(enrollmentRepo, 'create')
      .mockReturnValue({ student: user, course } as any);
    jest
      .spyOn(enrollmentRepo, 'save')
      .mockResolvedValue({ id: 'e1' } as Enrollment);

    const result = await service.enroll('u1', 'c1');
    expect(result.message).toBe('Enrollment successful');
  });

  it('should mark lesson as completed', async () => {
    const lesson = { id: 'l1' } as Lesson;
    const enrollment = {
      id: 'e1',
      student: { id: 'u1' },
      completedLessons: [],
    } as any;

    jest.spyOn(lessonRepo, 'findOneBy').mockResolvedValue(lesson);
    jest.spyOn(enrollmentRepo, 'findOne').mockResolvedValue(enrollment);
    managerMock.create.mockReturnValue({
      enrollment,
      lesson,
      completed_at: new Date(),
    });

    managerMock.save.mockResolvedValue(true);

    const result = await service.completeLesson('u1', 'l1');
    expect(result.message).toBe('Lesson marked as completed');
  });

  it('should return user progress', async () => {
    jest
      .spyOn(enrollmentRepo, 'find')
      .mockResolvedValue([
        { course: { name: 'Course 1' }, completedLessons: [] } as any,
      ]);

    const result = await service.getProgress('u1');
    expect(result.message).toBe('Your enrollments and progress');
    expect(result.enrollments.length).toBe(1);
  });
});
