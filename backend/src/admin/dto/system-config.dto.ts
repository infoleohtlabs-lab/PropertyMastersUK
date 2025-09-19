import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsUrl,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export enum ConfigCategory {
  DATABASE = 'database',
  EMAIL = 'email',
  API = 'api',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  SYSTEM = 'system',
}

export class CreateSystemConfigDto {
  @ApiProperty({ description: 'Configuration key' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Configuration value' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Configuration type', enum: ConfigType })
  @IsEnum(ConfigType)
  type: ConfigType;

  @ApiProperty({ description: 'Configuration category', enum: ConfigCategory })
  @IsEnum(ConfigCategory)
  category: ConfigCategory;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether configuration is encrypted' })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @ApiPropertyOptional({ description: 'Whether configuration is public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateSystemConfigDto {
  @ApiPropertyOptional({ description: 'Configuration value' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether configuration is encrypted' })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @ApiPropertyOptional({ description: 'Whether configuration is public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SystemConfigResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: string;

  @ApiProperty({ description: 'Configuration key' })
  key: string;

  @ApiProperty({ description: 'Configuration value' })
  value: string;

  @ApiProperty({ description: 'Configuration type', enum: ConfigType })
  type: ConfigType;

  @ApiProperty({ description: 'Configuration category', enum: ConfigCategory })
  category: ConfigCategory;

  @ApiPropertyOptional({ description: 'Configuration description' })
  description?: string;

  @ApiProperty({ description: 'Whether configuration is encrypted' })
  isEncrypted: boolean;

  @ApiProperty({ description: 'Whether configuration is public' })
  isPublic: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

// Database Configuration
export class DatabaseConfigDto {
  @ApiProperty({ description: 'Database host' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'Database port' })
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'Database name' })
  @IsString()
  database: string;

  @ApiProperty({ description: 'Database username' })
  @IsString()
  username: string;

  @ApiPropertyOptional({ description: 'Database password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Connection pool size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  poolSize?: number;

  @ApiPropertyOptional({ description: 'Connection timeout in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  connectionTimeout?: number;

  @ApiPropertyOptional({ description: 'Enable SSL connection' })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiPropertyOptional({ description: 'Enable query logging' })
  @IsOptional()
  @IsBoolean()
  logging?: boolean;
}

// Email Configuration
export class EmailConfigDto {
  @ApiProperty({ description: 'SMTP host' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'SMTP port' })
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'SMTP username' })
  @IsString()
  username: string;

  @ApiPropertyOptional({ description: 'SMTP password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'From email address' })
  @IsEmail()
  fromEmail: string;

  @ApiProperty({ description: 'From name' })
  @IsString()
  fromName: string;

  @ApiPropertyOptional({ description: 'Enable TLS' })
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiPropertyOptional({ description: 'Reject unauthorized certificates' })
  @IsOptional()
  @IsBoolean()
  rejectUnauthorized?: boolean;

  @ApiPropertyOptional({ description: 'Email rate limit per hour' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;
}

// API Configuration
export class RateLimitConfigDto {
  @ApiProperty({ description: 'Requests per window' })
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({ description: 'Window duration in milliseconds' })
  @IsNumber()
  @Min(1000)
  windowMs: number;

  @ApiPropertyOptional({ description: 'Skip successful requests' })
  @IsOptional()
  @IsBoolean()
  skipSuccessfulRequests?: boolean;

  @ApiPropertyOptional({ description: 'Skip failed requests' })
  @IsOptional()
  @IsBoolean()
  skipFailedRequests?: boolean;
}

export class ApiConfigDto {
  @ApiProperty({ description: 'API base URL' })
  @IsUrl()
  baseUrl: string;

  @ApiProperty({ description: 'API version' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Request timeout in milliseconds' })
  @IsNumber()
  @Min(1000)
  timeout: number;

  @ApiProperty({ description: 'Enable CORS' })
  @IsBoolean()
  corsEnabled: boolean;

  @ApiPropertyOptional({ description: 'Allowed origins for CORS' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @ApiProperty({ description: 'Rate limiting configuration', type: RateLimitConfigDto })
  @ValidateNested()
  @Type(() => RateLimitConfigDto)
  rateLimit: RateLimitConfigDto;

  @ApiPropertyOptional({ description: 'Enable API documentation' })
  @IsOptional()
  @IsBoolean()
  docsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Maximum request body size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(1024)
  maxBodySize?: number;
}

// Security Configuration
export class JwtConfigDto {
  @ApiPropertyOptional({ description: 'JWT secret key' })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiProperty({ description: 'JWT expiration time' })
  @IsString()
  expiresIn: string;

  @ApiProperty({ description: 'JWT refresh token expiration time' })
  @IsString()
  refreshExpiresIn: string;

  @ApiProperty({ description: 'JWT issuer' })
  @IsString()
  issuer: string;
}

export class PasswordPolicyDto {
  @ApiProperty({ description: 'Minimum password length' })
  @IsNumber()
  @Min(6)
  @Max(128)
  minLength: number;

  @ApiProperty({ description: 'Require uppercase letters' })
  @IsBoolean()
  requireUppercase: boolean;

  @ApiProperty({ description: 'Require lowercase letters' })
  @IsBoolean()
  requireLowercase: boolean;

  @ApiProperty({ description: 'Require numbers' })
  @IsBoolean()
  requireNumbers: boolean;

  @ApiProperty({ description: 'Require special characters' })
  @IsBoolean()
  requireSpecialChars: boolean;

  @ApiProperty({ description: 'Password expiration days' })
  @IsNumber()
  @Min(0)
  expirationDays: number;

  @ApiProperty({ description: 'Number of previous passwords to remember' })
  @IsNumber()
  @Min(0)
  @Max(24)
  historyCount: number;
}

export class SecurityConfigDto {
  @ApiProperty({ description: 'JWT configuration', type: JwtConfigDto })
  @ValidateNested()
  @Type(() => JwtConfigDto)
  jwt: JwtConfigDto;

  @ApiProperty({ description: 'Password policy', type: PasswordPolicyDto })
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @ApiProperty({ description: 'Maximum login attempts' })
  @IsNumber()
  @Min(1)
  @Max(10)
  maxLoginAttempts: number;

  @ApiProperty({ description: 'Account lockout duration in minutes' })
  @IsNumber()
  @Min(1)
  lockoutDuration: number;

  @ApiProperty({ description: 'Enable two-factor authentication' })
  @IsBoolean()
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Session timeout in minutes' })
  @IsNumber()
  @Min(5)
  sessionTimeout: number;

  @ApiPropertyOptional({ description: 'Allowed IP addresses' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPs?: string[];

  @ApiProperty({ description: 'Enable audit logging' })
  @IsBoolean()
  auditLogging: boolean;
}

// Integration Configuration
export class LandRegistryConfigDto {
  @ApiPropertyOptional({ description: 'Land Registry API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ description: 'Land Registry API URL' })
  @IsUrl()
  apiUrl: string;

  @ApiProperty({ description: 'Request timeout in milliseconds' })
  @IsNumber()
  @Min(1000)
  timeout: number;

  @ApiProperty({ description: 'Enable integration' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;
}

export class CompaniesHouseConfigDto {
  @ApiPropertyOptional({ description: 'Companies House API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ description: 'Companies House API URL' })
  @IsUrl()
  apiUrl: string;

  @ApiProperty({ description: 'Request timeout in milliseconds' })
  @IsNumber()
  @Min(1000)
  timeout: number;

  @ApiProperty({ description: 'Enable integration' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;
}

export class RoyalMailConfigDto {
  @ApiPropertyOptional({ description: 'Royal Mail PAF API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ description: 'Royal Mail PAF API URL' })
  @IsUrl()
  apiUrl: string;

  @ApiProperty({ description: 'Request timeout in milliseconds' })
  @IsNumber()
  @Min(1000)
  timeout: number;

  @ApiProperty({ description: 'Enable integration' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;
}

export class IntegrationConfigDto {
  @ApiProperty({ description: 'Land Registry configuration', type: LandRegistryConfigDto })
  @ValidateNested()
  @Type(() => LandRegistryConfigDto)
  landRegistry: LandRegistryConfigDto;

  @ApiProperty({ description: 'Companies House configuration', type: CompaniesHouseConfigDto })
  @ValidateNested()
  @Type(() => CompaniesHouseConfigDto)
  companiesHouse: CompaniesHouseConfigDto;

  @ApiProperty({ description: 'Royal Mail PAF configuration', type: RoyalMailConfigDto })
  @ValidateNested()
  @Type(() => RoyalMailConfigDto)
  royalMail: RoyalMailConfigDto;
}
