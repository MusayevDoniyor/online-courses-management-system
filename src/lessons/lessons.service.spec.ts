import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsService } from './lessons.service';
import { Lesson } from '../common/entities/lesson.entity';
import { CoursesModule } from '../common/entities/module.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { NotFoundException } from '@nestjs/common';

describe('LessonsService', () => {
  let service: LessonsService;
  let lessonRepo: Repository<Lesson>;
  let moduleRepo: Repository<CoursesModule>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CoursesModule),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
    lessonRepo = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
    moduleRepo = module.get<Repository<CoursesModule>>(
      getRepositoryToken(CoursesModule),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByModule', () => {
    it('should return lessons for a module', async () => {
      const result = [];
      jest.spyOn(lessonRepo, 'find').mockResolvedValue(result);
      expect(await service.findByModule('module-id')).toEqual({
        message: 'No lessons found in this module',
      });
    });
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const dto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test Content',
      };
      const module: any = { id: 'module-id' };
      const lesson: any = { id: 'lesson-id', ...dto, module };

      jest.spyOn(moduleRepo, 'findOne').mockResolvedValue(module);
      jest.spyOn(lessonRepo, 'create').mockReturnValue(lesson);
      jest.spyOn(lessonRepo, 'save').mockResolvedValue(lesson);

      expect(await service.create('module-id', dto)).toEqual({
        message: 'Lesson created successfully',
        lesson,
      });
    });

    it('should throw if module not found', async () => {
      const dto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test Content',
      };
      jest.spyOn(moduleRepo, 'findOne').mockResolvedValue(null);
      await expect(service.create('module-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a lesson', async () => {
      const lesson: any = { id: 'lesson-id' };
      jest.spyOn(lessonRepo, 'findOne').mockResolvedValue(lesson);
      expect(await service.findOne('lesson-id')).toEqual({
        message: 'Lesson found',
        lesson,
      });
    });

    it('should throw if lesson not found', async () => {
      jest.spyOn(lessonRepo, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('lesson-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const lesson: any = { id: 'lesson-id', title: 'Old Title' };
      const updatedLesson = { ...lesson, title: 'New Title' };
      const dto: UpdateLessonDto = { title: 'New Title' };

      jest.spyOn(lessonRepo, 'findOne').mockResolvedValue(lesson);
      jest.spyOn(lessonRepo, 'save').mockResolvedValue(updatedLesson);

      expect(await service.update('lesson-id', dto)).toEqual({
        message: 'Lesson updated successfully',
        lesson: updatedLesson,
      });
    });
  });

  describe('remove', () => {
    it('should delete a lesson', async () => {
      const lesson: any = { id: 'lesson-id' };
      jest.spyOn(lessonRepo, 'findOne').mockResolvedValue(lesson);
      jest
        .spyOn(lessonRepo, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });

      expect(await service.remove('lesson-id')).toEqual({
        message: 'Lesson removed successfully',
      });
    });

    it('should throw if lesson not found', async () => {
      jest.spyOn(lessonRepo, 'findOne').mockResolvedValue(null);
      await expect(service.remove('lesson-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
