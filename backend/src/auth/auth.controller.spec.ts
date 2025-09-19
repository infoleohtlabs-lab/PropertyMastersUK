import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { createTestUser, createTestJwtToken } from '../../test/test-utils';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = createTestUser({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT,
    isEmailVerified: true,
  });

  const mockTokenPair = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  const mockRequest = {
    user: mockUser,
    headers: {
      authorization: 'Bearer mock-access-token',
    },
  } as unknown as Request;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
      verifyEmail: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
      resendVerificationEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token pair on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockTokenPair);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockTokenPair);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should return user and tokens on successful registration', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.TENANT,
      };

      const mockRegistrationResult = {
        user: mockUser,
        tokens: mockTokenPair,
      };

      authService.register.mockResolvedValue(mockRegistrationResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockRegistrationResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException on validation error', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'weak',
        firstName: 'New',
        lastName: 'User',
      };

      authService.register.mockRejectedValue(new BadRequestException('Validation failed'));

      await expect(controller.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should return new token pair on valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(mockTokenPair);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(mockTokenPair);
      expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      authService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const logoutDto = {
        refreshToken: 'valid-refresh-token',
      };

      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(logoutDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith('valid-refresh-token');
    });
  });

  describe('logoutAll', () => {
    it('should logout from all devices successfully', async () => {
      authService.logoutAll.mockResolvedValue(undefined);

      const result = await controller.logoutAll(mockRequest);

      expect(result).toEqual({ message: 'Logged out from all devices successfully' });
      expect(authService.logoutAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifyEmailDto = {
        token: 'valid-verification-token',
      };

      authService.verifyEmail.mockResolvedValue(undefined);

      const result = await controller.verifyEmail(verifyEmailDto);

      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-verification-token');
    });

    it('should throw BadRequestException on invalid token', async () => {
      const verifyEmailDto = {
        token: 'invalid-token',
      };

      authService.verifyEmail.mockRejectedValue(new BadRequestException('Invalid verification token'));

      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const requestPasswordResetDto = {
        email: 'test@example.com',
      };

      const mockResult = {
        message: 'Password reset email sent',
      };

      authService.requestPasswordReset.mockResolvedValue(mockResult);

      const result = await controller.requestPasswordReset(requestPasswordResetDto);

      expect(result).toEqual(mockResult);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'NewStrongPassword123!',
      };

      const mockResult = {
        message: 'Password reset successfully',
      };

      authService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(mockResult);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'valid-reset-token',
        'NewStrongPassword123!'
      );
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      const resetPasswordDto = {
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      };

      authService.resetPassword.mockRejectedValue(new UnauthorizedException('Invalid reset token'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewStrongPassword123!',
      };

      const mockResult = {
        message: 'Password changed successfully',
      };

      authService.changePassword.mockResolvedValue(mockResult);

      const result = await controller.changePassword(changePasswordDto, mockRequest);

      expect(result).toEqual(mockResult);
      expect(authService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        'currentPassword123',
        'NewStrongPassword123!'
      );
    });

    it('should throw UnauthorizedException on incorrect current password', async () => {
      const changePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'NewPassword123!',
      };

      authService.changePassword.mockRejectedValue(new UnauthorizedException('Current password is incorrect'));

      await expect(controller.changePassword(changePasswordDto, mockRequest))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const resendVerificationDto = {
        email: 'test@example.com',
      };

      const mockResult = {
        message: 'Verification email sent',
      };

      authService.resendVerificationEmail.mockResolvedValue(mockResult);

      const result = await controller.resendVerificationEmail(resendVerificationDto);

      expect(result).toEqual(mockResult);
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
