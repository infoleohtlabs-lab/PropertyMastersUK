import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  private refreshTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.generateRefreshToken();
    
    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const emailVerificationToken = this.generateEmailVerificationToken();
    
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      emailVerificationToken,
      isEmailVerified: false,
    });
    
    // Send verification email
    await this.sendVerificationEmail(user.email, emailVerificationToken);
    
    const { password, ...result } = user;
    return {
      ...result,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = this.generatePasswordResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.updatePasswordResetToken(user.id, resetToken, resetTokenExpiry);
    await this.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'Password reset email sent successfully',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || user.passwordResetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    return {
      message: 'Password reset successfully',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.usersService.verifyEmail(user.id);

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = this.generateEmailVerificationToken();
    await this.usersService.updateEmailVerificationToken(user.id, emailVerificationToken);
    await this.sendVerificationEmail(email, emailVerificationToken);

    return {
      message: 'Verification email sent successfully',
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenData = this.refreshTokens.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(tokenData.userId);
    if (!user) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('User not found');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.generateRefreshToken();

    // Remove old refresh token and store new one
    this.refreshTokens.delete(refreshToken);
    this.refreshTokens.set(newRefreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      message: 'Password changed successfully',
    };
  }

  async logout(userId: string) {
    // Remove all refresh tokens for this user
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }

    return {
      message: 'Logged out successfully',
    };
  }

  async validateResetToken(token: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || user.passwordResetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return {
      valid: true,
      message: 'Token is valid',
    };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request - PropertyMasters UK',
        template: 'password-reset',
        context: {
          resetUrl,
          email,
        },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to avoid exposing email service issues
    }
  }

  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Email Verification - PropertyMasters UK',
        template: 'email-verification',
        context: {
          verificationUrl,
          email,
        },
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error to avoid exposing email service issues
    }
  }
}