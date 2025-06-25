import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const dto: RegisterDto = {
      name: 'Doniyor',
      email: 'test@code.com',
      password: '123456',
    };

    const expected = {
      message: 'User registered successfully',
      user: {
        id: 'uuid',
        name: 'Doniyor',
        email: 'test@code.com',
        role: 'student',
      },
    };

    mockAuthService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toEqual(expected);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user and set cookie', async () => {
    const dto: LoginDto = {
      email: 'test@code.com',
      password: '123456',
    };

    const expected = {
      message: 'User logged in successfully',
      user: {
        id: 'uuid',
        email: 'test@code.com',
        name: 'Doniyor',
        role: 'student',
      },
      access_token: 'mocked-token',
    };

    const mockRes = {
      cookie: jest.fn(),
    } as unknown as Response;

    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto, mockRes);

    expect(result).toEqual(expected);
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'access_token',
      expected.access_token,
      expect.objectContaining({
        httpOnly: true,
        secure: false,
      }),
    );
  });

  it('should return user profile', async () => {
    const mockUser = {
      id: 'uuid',
      email: 'test@code.com',
      role: 'student',
    };

    const expectedProfile = {
      id: 'uuid',
      email: 'test@code.com',
      name: 'Doniyor',
      role: 'student',
      created_at: new Date(),
    };

    mockAuthService.getProfile.mockResolvedValue(expectedProfile);

    const result = await controller.getProfile({ user: mockUser });
    expect(result).toEqual(expectedProfile);
    expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser);
  });
});
