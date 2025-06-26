import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('CourseService', () => {
  let service: CourseService;
  let repo: jest.Mocked<Repository<Course>>;

  const mockCourses = [
    {
      id: '1',
      name: 'NestJS Beginner',
      description: 'Intro to NestJS',
      price: 100000,
      teacherId: 'teacher-1',
      category: ['backend'],
      level: 'beginner',
      created_at: new Date(),
    },
  ];

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
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    repo = module.get(getRepositoryToken(Course));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a course', async () => {
      const dto = {
        name: 'Test Course',
        price: 50000,
        teacherId: 't1',
        category: ['web'],
        level: 'beginner',
      };

      const created = { ...dto, id: 'course-id' };
      repo.create.mockReturnValue(created as unknown as Course);
      repo.save.mockResolvedValue(created as unknown as Course);

      const result = await service.create(dto as any);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual({
        message: 'Course created successfully',
        course: created,
      });
    });
  });

  describe('findAll()', () => {
    it('should return courses if available', async () => {
      repo.find.mockResolvedValue(mockCourses as unknown as Course[]);

      const result = await service.findAll();
      expect(result.count).toBe(1);
      expect(result.message).toBe('Courses found successfuly');
    });

    it('should return message if no courses found', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result.message).toBe('Courses not available');
    });
  });

  describe('findOne()', () => {
    it('should return a course if found', async () => {
      repo.findOne.mockResolvedValue(mockCourses[0] as unknown as Course);

      const result = await service.findOne('1');
      expect(result.course.name).toBe('NestJS Beginner');
    });

    it('should throw NotFoundException if course not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update and return updated course', async () => {
      const existingCourse = { ...mockCourses[0] };
      repo.findOne.mockResolvedValue(existingCourse as unknown as Course);
      repo.save.mockResolvedValue({
        ...existingCourse,
        name: 'Updated',
        level: existingCourse.level as any,
        teacher: (existingCourse as any).teacher || null,
        updated_at: new Date(),
      } as unknown as Course);

      const result = await service.update('1', { name: 'Updated' } as any);
      expect(result.course.name).toBe('Updated');
      expect(result.message).toBe('Course updated successfully');
    });
  });

  describe('remove()', () => {
    it('should remove course if found', async () => {
      const existingCourse = mockCourses[0];
      repo.findOne.mockResolvedValue(existingCourse as unknown as Course);
      repo.remove.mockResolvedValue(existingCourse as unknown as Course);

      const result = await service.remove('1');
      expect(result.message).toBe('Course deleted successfully');
    });
  });
});
