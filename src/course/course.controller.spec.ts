import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseLevels } from '../common/entities/course.entity';

describe('CourseController', () => {
  let controller: CourseController;

  const mockCourseService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new course (admin only)', async () => {
      const dto: CreateCourseDto = {
        name: 'Test Course',
        price: 120000,
        teacherId: 'teacher-id',
        category: ['test'],
        level: CourseLevels.BEGINNER,
        description: 'Test desc',
      };

      const expected = {
        message: 'Course created successfully',
        course: { ...dto, id: 'uuid' },
      };

      mockCourseService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);
      expect(result).toEqual(expected);
      expect(mockCourseService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return all courses', async () => {
      const expected = {
        message: 'Courses found successfully',
        count: 2,
        courses: [],
      };
      mockCourseService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne()', () => {
    it('should return a course by id', async () => {
      const expected = {
        message: 'Course found',
        course: {
          id: '1',
          name: 'NestJS',
        },
      };

      mockCourseService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('1');
      expect(result).toEqual(expected);
    });
  });

  describe('update()', () => {
    it('should update a course by id (admin only)', async () => {
      const dto: UpdateCourseDto = {
        name: 'Updated Course',
      };

      const expected = {
        message: 'Course updated successfully',
        course: { id: '1', name: 'Updated Course' },
      };

      mockCourseService.update.mockResolvedValue(expected);

      const result = await controller.update('1', dto);
      expect(result).toEqual(expected);
      expect(mockCourseService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove()', () => {
    it('should remove a course by id (admin only)', async () => {
      const expected = { message: 'Course deleted successfully' };

      mockCourseService.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');
      expect(result).toEqual(expected);
      expect(mockCourseService.remove).toHaveBeenCalledWith('1');
    });
  });
});
