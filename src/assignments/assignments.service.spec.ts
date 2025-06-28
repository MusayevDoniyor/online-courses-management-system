import { Test } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from '../common/entities/assigment.entity';
import { CoursesModule } from '../common/entities/module.entity';
import { User } from '../common/entities/user.entity';
import { Result } from '../common/entities/result.entity';
import { Repository } from 'typeorm';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let assignmentRepo: Repository<Assignment>;
  let moduleRepo: Repository<CoursesModule>;
  let userRepo: Repository<User>;
  let resultRepo: Repository<Result>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: getRepositoryToken(Assignment),
          useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(CoursesModule),
          useValue: { findOne: jest.fn() },
        },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        {
          provide: getRepositoryToken(Result),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(AssignmentsService);
    assignmentRepo = moduleRef.get(getRepositoryToken(Assignment));
    moduleRepo = moduleRef.get(getRepositoryToken(CoursesModule));
    userRepo = moduleRef.get(getRepositoryToken(User));
    resultRepo = moduleRef.get(getRepositoryToken(Result));
  });

  it('should throw if no file or link provided', async () => {
    await expect(
      service.submitAssignment({ moduleId: '1', studentId: '2' }),
    ).rejects.toThrow();
  });

  it('should submit an assignment with fileUrl', async () => {
    const module = { id: 'mod1' };
    const student = { id: 'stu1' };

    moduleRepo.findOne = jest.fn().mockResolvedValue(module);
    userRepo.findOne = jest.fn().mockResolvedValue(student);
    assignmentRepo.create = jest.fn().mockReturnValue({ id: 'a1' });
    assignmentRepo.save = jest.fn();
    resultRepo.create = jest.fn().mockReturnValue({});
    resultRepo.save = jest.fn();

    const result = await service.submitAssignment({
      moduleId: 'mod1',
      studentId: 'stu1',
      fileUrl: 'someurl.pdf',
    });

    expect(result.message).toBe('Assignment submitted successfully');
    expect(result.assignmentId).toBeDefined();
  });
});
