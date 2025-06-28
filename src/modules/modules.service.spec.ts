import { Test, TestingModule } from '@nestjs/testing';
import { ModulesService } from './modules.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesModule } from '../common/entities/module.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockModule = {
  id: 'module-id',
  title: 'Test Module',
  description: 'Test Desc',
  course: { id: 'course-id' },
  created_at: new Date(),
};

describe('ModulesService', () => {
  let service: ModulesService;
  let repo: Repository<CoursesModule>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: getRepositoryToken(CoursesModule),
          useValue: {
            create: jest.fn().mockReturnValue(mockModule),
            save: jest.fn().mockResolvedValue(mockModule),
            find: jest.fn().mockResolvedValue([mockModule]),
            findOne: jest.fn().mockResolvedValue(mockModule),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
    repo = module.get<Repository<CoursesModule>>(
      getRepositoryToken(CoursesModule),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and return a module', async () => {
      const result = await service.create('course-id', {
        title: 'Test Module',
        description: 'Test Desc',
      });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.message).toBe('Module successfully added to course');
    });
  });

  describe('findModulesByCourse()', () => {
    it('should return modules for a course', async () => {
      const result = await service.findModulesByCourse('course-id');
      expect(repo.find).toHaveBeenCalled();
      expect(result.modules?.length).toBeGreaterThan(0);
    });

    it('should return message if no modules found', async () => {
      jest.spyOn(repo, 'find').mockResolvedValueOnce([]);
      const result = await service.findModulesByCourse('course-id');
      expect(result.message).toBe('Modules are not available in this course');
    });
  });

  describe('remove()', () => {
    it('should remove module if found', async () => {
      const result = await service.remove('module-id');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'module-id' } });
      expect(repo.delete).toHaveBeenCalledWith('module-id');
      expect(result.message).toBe('Module successfully removed from course');
    });

    it('should throw NotFoundException if module not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
