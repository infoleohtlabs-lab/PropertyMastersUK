import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  jwt: {
    secret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  password: {
    saltRounds: number;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  rateLimit: {
    login: {
      max: number;
      windowMs: number;
    };
    registration: {
      max: number;
      windowMs: number;
    };
    passwordReset: {
      max: number;
      windowMs: number;
    };
  };
  session: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
  };
  email: {
    verificationTokenExpiry: number;
    passwordResetTokenExpiry: number;
  };
}

@Injectable()
export class SecurityConfigService {
  private readonly config: SecurityConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      jwt: {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        accessTokenExpiry: this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m',
        refreshTokenExpiry: this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d',
      },
      password: {
        saltRounds: this.configService.get<number>('PASSWORD_SALT_ROUNDS') || 12,
        minLength: this.configService.get<number>('PASSWORD_MIN_LENGTH') || 8,
        requireUppercase: this.configService.get<boolean>('PASSWORD_REQUIRE_UPPERCASE') ?? true,
        requireLowercase: this.configService.get<boolean>('PASSWORD_REQUIRE_LOWERCASE') ?? true,
        requireNumbers: this.configService.get<boolean>('PASSWORD_REQUIRE_NUMBERS') ?? true,
        requireSpecialChars: this.configService.get<boolean>('PASSWORD_REQUIRE_SPECIAL') ?? true,
      },
      rateLimit: {
        login: {
          max: this.configService.get<number>('RATE_LIMIT_LOGIN_MAX') || 5,
          windowMs: this.configService.get<number>('RATE_LIMIT_LOGIN_WINDOW') || 15 * 60 * 1000,
        },
        registration: {
          max: this.configService.get<number>('RATE_LIMIT_REGISTER_MAX') || 3,
          windowMs: this.configService.get<number>('RATE_LIMIT_REGISTER_WINDOW') || 60 * 60 * 1000,
        },
        passwordReset: {
          max: this.configService.get<number>('RATE_LIMIT_PASSWORD_RESET_MAX') || 3,
          windowMs: this.configService.get<number>('RATE_LIMIT_PASSWORD_RESET_WINDOW') || 60 * 60 * 1000,
        },
      },
      session: {
        maxConcurrentSessions: this.configService.get<number>('MAX_CONCURRENT_SESSIONS') || 3,
        sessionTimeout: this.configService.get<number>('SESSION_TIMEOUT') || 24 * 60 * 60 * 1000,
      },
      email: {
        verificationTokenExpiry: this.configService.get<number>('EMAIL_VERIFICATION_EXPIRY') || 24 * 60 * 60 * 1000,
        passwordResetTokenExpiry: this.configService.get<number>('PASSWORD_RESET_EXPIRY') || 60 * 60 * 1000,
      },
    };
  }

  getConfig(): SecurityConfig {
    return this.config;
  }

  getJwtConfig() {
    return this.config.jwt;
  }

  getPasswordConfig() {
    return this.config.password;
  }

  getRateLimitConfig() {
    return this.config.rateLimit;
  }

  getSessionConfig() {
    return this.config.session;
  }

  getEmailConfig() {
    return this.config.email;
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config.password;

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
