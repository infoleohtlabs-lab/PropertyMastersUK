import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { SecurityConfigService } from './config/security.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';
import { TokenPair } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private securityConfig: SecurityConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Check if account is locked
    const isLocked = await this.usersService.isAccountLocked(user);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts');
    }

    const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user);
      return null;
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.usersService.resetFailedLoginAttempts(user.id);
    }

    return user;
  }

  async login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<TokenPair> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      user.tenantOrganizationId,
      deviceInfo,
      ipAddress,
    );
  }

  async register(registerDto: RegisterDto): Promise<{ user: any; tokens: any }> {
    const { email, password, firstName, lastName, role } = registerDto;
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.securityConfig.validatePassword(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.TENANT,
    });

    // Set email verification token
    const emailVerificationToken = this.tokenService.generateEmailVerificationToken();
    await this.usersService.updateEmailVerificationToken(user.id, emailVerificationToken);

    // Generate tokens for the new user
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      user.tenantOrganizationId,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.usersService.verifyEmail(user.id);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = this.tokenService.generatePasswordResetToken();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry
    await this.usersService.updatePasswordResetToken(user.id, resetToken, expiryDate);

    // TODO: Send password reset email
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    return { message: 'Password reset successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.requestPasswordReset(email);
    return { message: 'Password reset email sent successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const user = await this.usersService.findByPasswordResetToken(token);
    const isValid = user && user.passwordResetTokenExpiry && user.passwordResetTokenExpiry > new Date();
    return { valid: !!isValid };
  }

  async resendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = this.tokenService.generateEmailVerificationToken();
    await this.usersService.updateEmailVerificationToken(user.id, verificationToken);

    // TODO: Send verification email
    return { message: 'Verification email sent successfully' };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const maxAttempts = 5; // Could be configurable
    const lockDuration = 30 * 60 * 1000; // 30 minutes

    const newAttempts = user.failedLoginAttempts + 1;
    
    if (newAttempts >= maxAttempts) {
      await this.usersService.lockAccount(user.id, 30); // Lock for 30 minutes
    } else {
      await this.usersService.incrementFailedLoginAttempts(user.id);
    }
  }
}
