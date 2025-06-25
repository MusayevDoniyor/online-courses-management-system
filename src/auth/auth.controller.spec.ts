import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

    const expectedResult = {
      message: 'User registered successfully',
      user: {
        id: 'uuid',
        name: 'Doniyor',
        email: 'test@code.com',
        role: 'student',
      },
    };

    mockAuthService.register.mockResolvedValue(expectedResult);

    const result = await controller.register(dto);
    expect(result).toEqual(expectedResult);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user and return token + user info', async () => {
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

    // mock response object
    const res = {
      cookie: jest.fn(),
    } as any;

    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto, res);

    expect(result).toEqual(expected);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      expected.access_token,
      expect.objectContaining({
        httpOnly: true,
        secure: false, // NODE_ENV !== production by default
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
