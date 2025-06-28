import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../common/entities/course.entity';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CourseService', () => {
  let service: CourseService;
  let courseRepo: jest.Mocked<Repository<Course>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockTeacher = {
    id: 'teacher-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockCourse = {
    id: 'course-1',
    name: 'NestJS Course',
    description: 'Intro',
    price: 100,
    category: ['backend'],
    level: 'beginner',
    teacher: mockTeacher,
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    courseRepo = module.get(getRepositoryToken(Course));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should throw if teacher not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          name: 'Test',
          price: 50000,
          teacherId: 'not-found',
          category: ['web'],
          level: 'beginner',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create course with teacher', async () => {
      userRepo.findOne.mockResolvedValue(mockTeacher as User);
      const createdCourse = { ...mockCourse };
      courseRepo.create.mockReturnValue(createdCourse as Course);
      courseRepo.save.mockResolvedValue(createdCourse as Course);

      const dto = {
        name: 'Test Course',
        price: 100000,
        teacherId: mockTeacher.id,
        category: ['backend'],
        level: 'beginner',
      };

      const result = await service.create(dto as any);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.teacherId },
      });
      expect(courseRepo.create).toHaveBeenCalled();
      expect(result.course.name).toBe('NestJS Course');
      expect(result.course.teacher.email).toBe(mockTeacher.email);
    });
  });

  describe('findAll()', () => {
    it('should return all courses', async () => {
      courseRepo.find.mockResolvedValue([mockCourse as Course]);
      const result = await service.findAll();
      expect(result.count).toBe(1);
      expect(result.message).toBe('Courses found successfuly');
    });

    it('should return message if no course found', async () => {
      courseRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result.message).toBe('Courses not available');
    });
  });

  describe('findOne()', () => {
    it('should return course if exists', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse as Course);
      const result = await service.findOne('course-1');
      expect(result.course.id).toBe('course-1');
    });

    it('should throw if course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('wrong-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update course successfully', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse as Course);
      courseRepo.save.mockResolvedValue({
        ...mockCourse,
        name: 'Updated Course',
      } as Course);

      const result = await service.update('course-1', {
        name: 'Updated Course',
      } as any);

      expect(result.course.name).toBe('Updated Course');
    });
  });

  describe('remove()', () => {
    it('should remove course if found', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse as Course);
      courseRepo.remove.mockResolvedValue(mockCourse as Course);
      const result = await service.remove('course-1');
      expect(result.message).toBe('Course deleted successfully');
    });
  });
});
