import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SecurityConfigService } from '../config/security.config';

@Injectable()
export class PasswordService {
  constructor(private securityConfig: SecurityConfigService) {}

  async hashPassword(password: string): Promise<string> {
    // Validate password before hashing
    const validation = this.validatePassword(password);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: validation.errors,
      });
    }

    const saltRounds = this.securityConfig.getPasswordConfig().saltRounds;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return this.securityConfig.validatePassword(password);
  }

  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const config = this.securityConfig.getPasswordConfig();
    let charset = '';
    let password = '';

    // Ensure at least one character from each required category
    if (config.requireUppercase) {
      charset += uppercase;
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    }

    if (config.requireLowercase) {
      charset += lowercase;
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    }

    if (config.requireNumbers) {
      charset += numbers;
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }

    if (config.requireSpecialChars) {
      charset += specialChars;
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    // Fill the rest of the password length
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password to avoid predictable patterns
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  checkPasswordStrength(password: string): {
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) suggestions.push('Consider using 12+ characters for better security');

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('Include numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else suggestions.push('Include special characters');

    // Pattern checks
    if (!/(..).*\1/.test(password)) score += 1;
    else suggestions.push('Avoid repeating patterns');

    if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
      score += 1;
    } else {
      suggestions.push('Avoid sequential characters');
    }

    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 3) strength = 'weak';
    else if (score <= 5) strength = 'fair';
    else if (score <= 7) strength = 'good';
    else strength = 'strong';

    return { score, strength, suggestions };
  }
}
