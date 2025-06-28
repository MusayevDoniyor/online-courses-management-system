import { Test } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let service: AssignmentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: {
            submitAssignment: jest.fn().mockResolvedValue({
              message: 'Assignment submitted successfully',
              assignmentId: '123',
            }),
            getStudentAssignments: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AssignmentsController);
    service = moduleRef.get(AssignmentsService);
  });

  it('should submit assignment via controller', async () => {
    const mockRequest: any = { user: { id: 'student123' } };

    const result = await controller.submitAssignment(
      'module1',
      'http://link.com',
      mockRequest,
    );

    expect(result.message).toBe('Assignment submitted successfully');
    expect(service.submitAssignment).toHaveBeenCalled();
  });

  it('should return student assignments', async () => {
    const req = { user: { id: 's1' } } as any;
    const result = await controller.getMyAssignments(req);

    expect(Array.isArray(result)).toBe(true);
  });
});
