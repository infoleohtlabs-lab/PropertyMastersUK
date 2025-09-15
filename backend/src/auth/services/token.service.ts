import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { SecurityConfigService } from '../config/security.config';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as crypto from 'crypto';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}



@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityConfig: SecurityConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {
    // Cleanup expired tokens every hour
    setInterval(async () => {
      try {
        await this.cleanupExpiredTokens();
      } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
      }
    }, 60 * 60 * 1000);
  }

  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    tenantId?: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const sessionId = this.generateSessionId();
    const jwtConfig = this.securityConfig.getJwtConfig();
    const sessionConfig = this.securityConfig.getSessionConfig();

    // Check and enforce max concurrent sessions
    await this.enforceMaxSessions(userId);

    const payload = {
      userId,
      email,
      role,
      tenantId,
      sessionId,
      jti: sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: this.parseTimeString(jwtConfig.accessTokenExpiry) / 1000, // Convert to seconds
    });

    const refreshTokenString = this.generateRefreshToken();
    const refreshTokenExpiry = new Date();
    // Use JWT refresh token expiry from config (convert from string like '7d' to milliseconds)
    const refreshExpiryMs = this.parseTimeString(jwtConfig.refreshTokenExpiry);
    refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() + refreshExpiryMs);

    // Save refresh token to database
    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenString,
      userId,
      sessionId,
      expiresAt: refreshTokenExpiry,
      isRevoked: false,
      deviceInfo,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: this.parseTimeString(jwtConfig.accessTokenExpiry) / 1000, // Convert to seconds
    };
  }

  async refreshAccessToken(refreshTokenString: string): Promise<TokenPair> {
    const tokenData = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenString },
      relations: ['user'],
    });

    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenData.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (tokenData.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(tokenData.id);
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Generate new token pair
    const user = tokenData.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token
    await this.revokeToken(refreshTokenString);

    return this.generateTokenPair(
      user.id,
      user.email,
      user.role,
      user.tenantOrganizationId,
      tokenData.deviceInfo,
      tokenData.ipAddress,
    );
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const jwtConfig = this.securityConfig.getJwtConfig();
      const payload = this.jwtService.verify(token, {
        secret: jwtConfig.secret,
      }) as JwtPayload;

      // Check if session is still valid
      const session = await this.refreshTokenRepository.findOne({
        where: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          isRevoked: false,
          expiresAt: MoreThan(new Date()),
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session has been terminated');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async revokeToken(refreshTokenString: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token: refreshTokenString },
      { isRevoked: true },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    // Revoke refresh tokens for specific session
    await this.refreshTokenRepository.update(
      { userId, sessionId, isRevoked: false },
      { isRevoked: true },
    );
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private parseTimeString(timeStr: string): number {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit as keyof typeof units];
  }

  private async enforceMaxSessions(userId: string): Promise<void> {
    const maxSessions = this.securityConfig.getSessionConfig().maxConcurrentSessions;
    
    // Get active sessions for user
    const activeSessions = await this.refreshTokenRepository.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'ASC' },
    });

    if (activeSessions.length >= maxSessions) {
      // Revoke oldest sessions
      const sessionsToRevoke = activeSessions.slice(0, activeSessions.length - maxSessions + 1);
      const sessionIds = sessionsToRevoke.map(session => session.id);
      
      await this.refreshTokenRepository.update(
        { id: In(sessionIds) },
        { isRevoked: true },
      );
    }
  }

  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    
    // Delete expired tokens
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(now),
    });
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000; // Default 15 minutes
    }
  }

  async getUserActiveSessions(userId: string): Promise<string[]> {
    const sessions = await this.refreshTokenRepository.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      select: ['sessionId'],
    });
    
    return sessions.map(session => session.sessionId);
  }

  async getActiveSessionsCount(userId: string): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const token = await this.refreshTokenRepository.findOne({
      where: { sessionId: jti },
    });
    
    return token ? token.isRevoked : false;
  }
}