import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: {
            findByModule: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByModule', () => {
    it('should return lessons for a module', async () => {
      const result = {
        lessons: [],
        message: 'No lessons found in this module',
      };
      jest.spyOn(service, 'findByModule').mockResolvedValue(result);
      expect(await controller.findByModule('module-id')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const dto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test Content',
      };
      const result: any = {
        lesson: {},
        message: 'Lesson created successfully',
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);
      expect(await controller.create('module-id', dto)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a lesson', async () => {
      const result: any = { lesson: {}, message: 'Lesson found' };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);
      expect(await controller.findOne('lesson-id')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const dto: UpdateLessonDto = { title: 'Updated Title' };
      const result: any = {
        lesson: {},
        message: 'Lesson updated successfully',
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);
      expect(await controller.update('lesson-id', dto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should delete a lesson', async () => {
      const result = { message: 'Lesson removed successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);
      expect(await controller.remove('lesson-id')).toBe(result);
    });
  });
});
