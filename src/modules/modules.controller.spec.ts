import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;
  let service: ModulesService;

  const mockService = {
    findModulesByCourse: jest.fn().mockResolvedValue({
      message: 'All modules for this course',
      modules: [],
    }),
    create: jest.fn().mockResolvedValue({
      message: 'Module successfully added to course',
      module: {},
    }),
    remove: jest.fn().mockResolvedValue({
      message: 'Module successfully removed from course',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [{ provide: ModulesService, useValue: mockService }],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
    service = module.get<ModulesService>(ModulesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get modules by course ID', async () => {
    const result = await controller.findByCourse('course-id');
    expect(result.message).toBe('All modules for this course');
    expect(service.findModulesByCourse).toHaveBeenCalledWith('course-id');
  });

  it('should create module', async () => {
    const dto = { title: 'Test', description: 'Desc' };
    const result = await controller.create('course-id', dto);
    expect(result.message).toBe('Module successfully added to course');
    expect(service.create).toHaveBeenCalledWith('course-id', dto);
  });

  it('should delete module', async () => {
    const result = await controller.remove('module-id');
    expect(result.message).toBe('Module successfully removed from course');
    expect(service.remove).toHaveBeenCalledWith('module-id');
  });
});
