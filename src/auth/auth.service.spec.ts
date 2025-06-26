import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'JWT_SECRET') return 'test-secret';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register user successfully', async () => {
    mockUserRepo.findOne.mockResolvedValue(null); // user not exists
    mockUserRepo.create.mockReturnValue({
      email: 'test@test.com',
      password: 'hashed',
    });
    mockUserRepo.save.mockResolvedValue({
      id: 'uuid',
      email: 'test@test.com',
      password: 'hashed',
    });

    const result = await service.register({
      name: 'Test',
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.user.email).toBe('test@test.com');
    expect(mockUserRepo.create).toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalled();
  });
});
