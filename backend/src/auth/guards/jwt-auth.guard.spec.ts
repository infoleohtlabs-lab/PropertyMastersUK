import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMockExecutionContext } from '../../../test/test-utils';
import { UserRole } from '../../users/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: UserRole.TENANT,
    tenantOrganizationId: 'org-123',
  };

  const mockJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    tenantOrganizationId: mockUser.tenantOrganizationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const mockJwtService = {
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid JWT token', async () => {
      const mockContext = createMockExecutionContext({
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false); // Not public route
      jwtService.verify.mockReturnValue(mockJwtPayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockContext.switchToHttp().getRequest().user).toEqual({
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
        role: mockJwtPayload.role,
        tenantOrganizationId: mockJwtPayload.tenantOrganizationId,
      });
    });

    it('should return true for public routes without token', async () => {
      const mockContext = createMockExecutionContext({
        headers: {},
      });

      reflector.getAllAndOverride.mockReturnValue(true); // Public route

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no token provided for protected route', async () => {
      const mockContext = createMockExecutionContext({
        headers: {},
      });

      reflector.getAllAndOverride.mockReturnValue(false); // Protected route

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token format is invalid', async () => {
      const mockContext = createMockExecutionContext({
        headers: {
          authorization: 'InvalidFormat token',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      const mockContext = createMockExecutionContext({
        headers: {
          authorization: 'Bearer invalid-jwt-token',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const expiredPayload = {
        ...mockJwtPayload,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      const mockContext = createMockExecutionContext({
        headers: {
          authorization: 'Bearer expired-jwt-token',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle Bearer token with extra spaces', async () => {
      const mockContext = createMockExecutionContext({
        headers: {
          authorization: '  Bearer   valid-jwt-token  ',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockJwtPayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    });

    it('should extract token from different authorization header formats', async () => {
      const testCases = [
        'Bearer valid-jwt-token',
        'bearer valid-jwt-token',
        'BEARER valid-jwt-token',
      ];

      for (const authHeader of testCases) {
        const mockContext = createMockExecutionContext({
          headers: {
            authorization: authHeader,
          },
        });

        reflector.getAllAndOverride.mockReturnValue(false);
        jwtService.verify.mockReturnValue(mockJwtPayload);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
        expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');

        jest.clearAllMocks();
      }
    });

    it('should handle missing user properties in JWT payload', async () => {
      const incompletePayload = {
        sub: mockUser.id,
        email: mockUser.email,
        // Missing role and tenantOrganizationId
      };

      const mockContext = createMockExecutionContext({
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });

      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(incompletePayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockContext.switchToHttp().getRequest().user).toEqual({
        id: incompletePayload.sub,
        email: incompletePayload.email,
        role: undefined,
        tenantOrganizationId: undefined,
      });
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const request = {
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBe('valid-jwt-token');
    });

    it('should return undefined for missing authorization header', () => {
      const request = {
        headers: {},
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBeUndefined();
    });

    it('should return undefined for invalid authorization format', () => {
      const request = {
        headers: {
          authorization: 'Basic username:password',
        },
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBeUndefined();
    });

    it('should return undefined for Bearer without token', () => {
      const request = {
        headers: {
          authorization: 'Bearer',
        },
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBeUndefined();
    });
  });
});
