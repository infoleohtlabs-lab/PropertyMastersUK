import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { SecurityConfigService } from './config/security.config';
import { UnauthorizedException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { createTestUser } from '../../test/test-utils';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let securityConfig: jest.Mocked<SecurityConfigService>;

  const mockUser = createTestUser({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT,
    isEmailVerified: true,
    failedLoginAttempts: 0,
  });

  const mockTokenPair = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      isAccountLocked: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
      incrementFailedLoginAttempts: jest.fn(),
      lockAccount: jest.fn(),
      updateEmailVerificationToken: jest.fn(),
      findByEmailVerificationToken: jest.fn(),
      verifyEmail: jest.fn(),
      updatePasswordResetToken: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      updatePassword: jest.fn(),
      clearPasswordResetToken: jest.fn(),
    };

    const mockTokenService = {
      generateTokenPair: jest.fn(),
      refreshAccessToken: jest.fn(),
      revokeToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      generateEmailVerificationToken: jest.fn(),
      generatePasswordResetToken: jest.fn(),
    };

    const mockPasswordService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    const mockSecurityConfig = {
      validatePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: SecurityConfigService, useValue: mockSecurityConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    tokenService = module.get(TokenService);
    passwordService = module.get(PasswordService);
    securityConfig = module.get(SecurityConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.isAccountLocked.mockResolvedValue(false);
      passwordService.comparePassword.mockResolvedValue(true);
      usersService.resetFailedLoginAttempts.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(passwordService.comparePassword).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.isAccountLocked.mockResolvedValue(true);

      await expect(service.validateUser('test@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return null and handle failed login when password is invalid', async () => {
      const userWithFailedAttempts = { ...mockUser, failedLoginAttempts: 2 };
      usersService.findByEmail.mockResolvedValue(userWithFailedAttempts);
      usersService.isAccountLocked.mockResolvedValue(false);
      passwordService.comparePassword.mockResolvedValue(false);
      usersService.incrementFailedLoginAttempts.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.incrementFailedLoginAttempts).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('login', () => {
    it('should return token pair when login is successful', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.isAccountLocked.mockResolvedValue(false);
      passwordService.comparePassword.mockResolvedValue(true);
      tokenService.generateTokenPair.mockResolvedValue(mockTokenPair);

      const loginDto = { email: 'test@example.com', password: 'password123' };
      const result = await service.login(loginDto);

      expect(result).toEqual(mockTokenPair);
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
        mockUser.tenantOrganizationId,
        undefined,
        undefined,
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      usersService.findByEmail.mockResolvedValue(unverifiedUser);
      usersService.isAccountLocked.mockResolvedValue(false);
      passwordService.comparePassword.mockResolvedValue(true);

      const loginDto = { email: 'test@example.com', password: 'password123' };
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.TENANT,
      };

      usersService.findByEmail.mockResolvedValue(null);
      securityConfig.validatePassword.mockReturnValue({ isValid: true, errors: [] });
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      tokenService.generateEmailVerificationToken.mockReturnValue('verification-token');
      tokenService.generateTokenPair.mockResolvedValue(mockTokenPair);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens).toEqual(mockTokenPair);
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when password is weak', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'weak',
        firstName: 'New',
        lastName: 'User',
      };

      usersService.findByEmail.mockResolvedValue(null);
      securityConfig.validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 8 characters long'],
      });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should return new token pair when refresh token is valid', async () => {
      tokenService.refreshAccessToken.mockResolvedValue(mockTokenPair);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual(mockTokenPair);
      expect(tokenService.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      tokenService.revokeToken.mockResolvedValue(undefined);

      await service.logout('refresh-token');

      expect(tokenService.revokeToken).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email when token is valid', async () => {
      usersService.findByEmailVerificationToken.mockResolvedValue(mockUser);
      usersService.verifyEmail.mockResolvedValue(undefined);

      await service.verifyEmail('valid-token');

      expect(usersService.verifyEmail).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException when token is invalid', async () => {
      usersService.findByEmailVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid', async () => {
      const userWithResetToken = {
        ...mockUser,
        passwordResetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      };
      usersService.findByPasswordResetToken.mockResolvedValue(userWithResetToken);
      passwordService.hashPassword.mockResolvedValue('newHashedPassword');
      usersService.updatePassword.mockResolvedValue(undefined);
      usersService.clearPasswordResetToken.mockResolvedValue(undefined);

      const result = await service.resetPassword('valid-token', 'newPassword123');

      expect(result.message).toBe('Password reset successfully');
      expect(usersService.updatePassword).toHaveBeenCalledWith(mockUser.id, 'newHashedPassword');
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
      };
      usersService.findByPasswordResetToken.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword('expired-token', 'newPassword123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(true);
      passwordService.hashPassword.mockResolvedValue('newHashedPassword');
      usersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.changePassword(mockUser.id, 'currentPassword', 'newPassword123');

      expect(result.message).toBe('Password changed successfully');
      expect(usersService.updatePassword).toHaveBeenCalledWith(mockUser.id, 'newHashedPassword');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.changePassword('nonexistent-id', 'current', 'new'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      passwordService.comparePassword.mockResolvedValue(false);

      await expect(service.changePassword(mockUser.id, 'wrongPassword', 'newPassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
