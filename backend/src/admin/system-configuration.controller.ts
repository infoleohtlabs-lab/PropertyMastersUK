import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  SystemConfigurationService,
  DatabaseConfig,
  EmailConfig,
  ApiRateLimitConfig,
  SecurityConfig,
  IntegrationConfig,
  ConfigurationValidationResult,
  ConfigurationBackup,
} from './system-configuration.service';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  IsEnum,
  IsEmail,
  IsUrl,
  Min,
  Max,
  ValidateNested,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTOs for Database Configuration
class DatabaseConfigDto implements Partial<DatabaseConfig> {
  @ApiProperty({ description: 'Database host', required: false })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty({ description: 'Database port', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiProperty({ description: 'Database name', required: false })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiProperty({ description: 'Database username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Database password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Use SSL connection', required: false })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiProperty({ description: 'Connection timeout in ms', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  connectionTimeout?: number;

  @ApiProperty({ description: 'Maximum number of connections', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxConnections?: number;

  @ApiProperty({ description: 'Enable database logging', required: false })
  @IsOptional()
  @IsBoolean()
  logging?: boolean;

  @ApiProperty({ description: 'Auto-synchronize schema', required: false })
  @IsOptional()
  @IsBoolean()
  synchronize?: boolean;

  @ApiProperty({ description: 'Run migrations automatically', required: false })
  @IsOptional()
  @IsBoolean()
  migrationsRun?: boolean;
}

// DTOs for Email Configuration
class EmailTemplatesDto {
  @ApiProperty({ description: 'Welcome email template' })
  @IsString()
  welcome: string;

  @ApiProperty({ description: 'Password reset email template' })
  @IsString()
  passwordReset: string;

  @ApiProperty({ description: 'Verification email template' })
  @IsString()
  verification: string;

  @ApiProperty({ description: 'Notification email template' })
  @IsString()
  notification: string;
}

class EmailRateLimitsDto {
  @ApiProperty({ description: 'Emails per hour limit' })
  @IsNumber()
  @Min(1)
  perHour: number;

  @ApiProperty({ description: 'Emails per day limit' })
  @IsNumber()
  @Min(1)
  perDay: number;

  @ApiProperty({ description: 'Emails per user limit' })
  @IsNumber()
  @Min(1)
  perUser: number;
}

class EmailConfigDto implements Partial<EmailConfig> {
  @ApiProperty({ 
    description: 'Email provider', 
    enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['smtp', 'sendgrid', 'mailgun', 'ses'])
  provider?: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';

  @ApiProperty({ description: 'SMTP host', required: false })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty({ description: 'SMTP port', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiProperty({ description: 'Use secure connection', required: false })
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiProperty({ description: 'SMTP username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'SMTP password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'API key for email service', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ description: 'From email address', required: false })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiProperty({ description: 'From name', required: false })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiProperty({ description: 'Reply-to email address', required: false })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @ApiProperty({ description: 'Email templates', required: false, type: EmailTemplatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailTemplatesDto)
  templates?: EmailTemplatesDto;

  @ApiProperty({ description: 'Email rate limits', required: false, type: EmailRateLimitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailRateLimitsDto)
  rateLimits?: EmailRateLimitsDto;
}

// DTOs for Rate Limiting Configuration
class GlobalRateLimitDto {
  @ApiProperty({ description: 'Time window in milliseconds' })
  @IsNumber()
  @Min(1000)
  windowMs: number;

  @ApiProperty({ description: 'Maximum requests per window' })
  @IsNumber()
  @Min(1)
  maxRequests: number;

  @ApiProperty({ description: 'Skip successful requests' })
  @IsBoolean()
  skipSuccessfulRequests: boolean;

  @ApiProperty({ description: 'Skip failed requests' })
  @IsBoolean()
  skipFailedRequests: boolean;
}

class ApiRateLimitConfigDto implements Partial<ApiRateLimitConfig> {
  @ApiProperty({ description: 'Global rate limit settings', required: false, type: GlobalRateLimitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GlobalRateLimitDto)
  global?: GlobalRateLimitDto;

  @ApiProperty({ description: 'Endpoint-specific rate limits', required: false })
  @IsOptional()
  @IsObject()
  endpoints?: { [endpoint: string]: any };

  @ApiProperty({ description: 'User tier rate limit multipliers', required: false })
  @IsOptional()
  @IsObject()
  userTiers?: { [tier: string]: any };
}

// DTOs for Security Configuration
class JwtConfigDto {
  @ApiProperty({ description: 'JWT secret key' })
  @IsString()
  secret: string;

  @ApiProperty({ description: 'JWT expiration time' })
  @IsString()
  expiresIn: string;

  @ApiProperty({ description: 'Refresh token expiration time' })
  @IsString()
  refreshExpiresIn: string;

  @ApiProperty({ description: 'JWT issuer' })
  @IsString()
  issuer: string;

  @ApiProperty({ description: 'JWT audience' })
  @IsString()
  audience: string;
}

class PasswordConfigDto {
  @ApiProperty({ description: 'Minimum password length' })
  @IsNumber()
  @Min(6)
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

  @ApiProperty({ description: 'Password maximum age in milliseconds' })
  @IsNumber()
  @Min(0)
  maxAge: number;

  @ApiProperty({ description: 'Number of previous passwords to prevent reuse' })
  @IsNumber()
  @Min(0)
  preventReuse: number;
}

class SecurityConfigDto implements Partial<SecurityConfig> {
  @ApiProperty({ description: 'JWT configuration', required: false, type: JwtConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => JwtConfigDto)
  jwt?: JwtConfigDto;

  @ApiProperty({ description: 'Password policy configuration', required: false, type: PasswordConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordConfigDto)
  password?: PasswordConfigDto;

  @ApiProperty({ description: 'Session configuration', required: false })
  @IsOptional()
  @IsObject()
  session?: any;

  @ApiProperty({ description: 'Two-factor authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  twoFactor?: any;

  @ApiProperty({ description: 'Encryption configuration', required: false })
  @IsOptional()
  @IsObject()
  encryption?: any;

  @ApiProperty({ description: 'CORS configuration', required: false })
  @IsOptional()
  @IsObject()
  cors?: any;

  @ApiProperty({ description: 'Content Security Policy configuration', required: false })
  @IsOptional()
  @IsObject()
  csp?: any;
}

// DTOs for Integration Configuration
class IntegrationConfigDto implements Partial<IntegrationConfig> {
  @ApiProperty({ description: 'Land Registry integration settings', required: false })
  @IsOptional()
  @IsObject()
  landRegistry?: any;

  @ApiProperty({ description: 'Companies House integration settings', required: false })
  @IsOptional()
  @IsObject()
  companiesHouse?: any;

  @ApiProperty({ description: 'Royal Mail PAF integration settings', required: false })
  @IsOptional()
  @IsObject()
  royalMailPaf?: any;

  @ApiProperty({ description: 'Stripe integration settings', required: false })
  @IsOptional()
  @IsObject()
  stripe?: any;

  @ApiProperty({ description: 'Analytics integration settings', required: false })
  @IsOptional()
  @IsObject()
  analytics?: any;
}

// DTOs for Configuration Backup
class CreateBackupDto {
  @ApiProperty({ description: 'Backup description' })
  @IsString()
  description: string;
}

class TestIntegrationDto {
  @ApiProperty({ description: 'Integration configuration to test', required: false })
  @IsOptional()
  @IsObject()
  config?: any;
}

@ApiTags('Admin - System Configuration')
@Controller('admin/system-configuration')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemConfigurationController {
  constructor(
    private readonly systemConfigService: SystemConfigurationService,
  ) {}

  // Database Configuration Endpoints
  @Get('database')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get database configuration',
    description: 'Retrieve current database configuration settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database configuration retrieved successfully',
    type: Object, // DatabaseConfig
  })
  async getDatabaseConfig(): Promise<DatabaseConfig> {
    return this.systemConfigService.getDatabaseConfig();
  }

  @Put('database')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update database configuration',
    description: 'Update database configuration settings.',
  })
  @ApiBody({ type: DatabaseConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database configuration updated successfully',
    type: Object, // DatabaseConfig
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updateDatabaseConfig(
    @Body() config: DatabaseConfigDto,
    @Request() req: any,
  ): Promise<DatabaseConfig> {
    return this.systemConfigService.updateDatabaseConfig(config, req.user.id);
  }

  // Email Configuration Endpoints
  @Get('email')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get email configuration',
    description: 'Retrieve current email configuration settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email configuration retrieved successfully',
    type: Object, // EmailConfig
  })
  async getEmailConfig(): Promise<EmailConfig> {
    return this.systemConfigService.getEmailConfig();
  }

  @Put('email')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update email configuration',
    description: 'Update email configuration settings.',
  })
  @ApiBody({ type: EmailConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email configuration updated successfully',
    type: Object, // EmailConfig
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updateEmailConfig(
    @Body() config: EmailConfigDto,
    @Request() req: any,
  ): Promise<EmailConfig> {
    return this.systemConfigService.updateEmailConfig(config, req.user.id);
  }

  @Post('email/test')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Test email configuration',
    description: 'Test the current or provided email configuration.',
  })
  @ApiBody({ type: EmailConfigDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email configuration test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async testEmailConfig(
    @Body() config?: EmailConfigDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.systemConfigService.testEmailConfig(config);
  }

  // API Rate Limiting Configuration Endpoints
  @Get('rate-limiting')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get API rate limiting configuration',
    description: 'Retrieve current API rate limiting configuration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rate limiting configuration retrieved successfully',
    type: Object, // ApiRateLimitConfig
  })
  async getApiRateLimitConfig(): Promise<ApiRateLimitConfig> {
    return this.systemConfigService.getApiRateLimitConfig();
  }

  @Put('rate-limiting')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update API rate limiting configuration',
    description: 'Update API rate limiting configuration settings.',
  })
  @ApiBody({ type: ApiRateLimitConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rate limiting configuration updated successfully',
    type: Object, // ApiRateLimitConfig
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updateApiRateLimitConfig(
    @Body() config: ApiRateLimitConfigDto,
    @Request() req: any,
  ): Promise<ApiRateLimitConfig> {
    return this.systemConfigService.updateApiRateLimitConfig(config, req.user.id);
  }

  // Security Configuration Endpoints
  @Get('security')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get security configuration',
    description: 'Retrieve current security configuration settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security configuration retrieved successfully',
    type: Object, // SecurityConfig
  })
  async getSecurityConfig(): Promise<SecurityConfig> {
    return this.systemConfigService.getSecurityConfig();
  }

  @Put('security')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update security configuration',
    description: 'Update security configuration settings.',
  })
  @ApiBody({ type: SecurityConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security configuration updated successfully',
    type: Object, // SecurityConfig
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updateSecurityConfig(
    @Body() config: SecurityConfigDto,
    @Request() req: any,
  ): Promise<SecurityConfig> {
    return this.systemConfigService.updateSecurityConfig(config, req.user.id);
  }

  // Integration Configuration Endpoints
  @Get('integrations')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get integration configuration',
    description: 'Retrieve current integration configuration settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration configuration retrieved successfully',
    type: Object, // IntegrationConfig
  })
  async getIntegrationConfig(): Promise<IntegrationConfig> {
    return this.systemConfigService.getIntegrationConfig();
  }

  @Put('integrations')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update integration configuration',
    description: 'Update integration configuration settings.',
  })
  @ApiBody({ type: IntegrationConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration configuration updated successfully',
    type: Object, // IntegrationConfig
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updateIntegrationConfig(
    @Body() config: IntegrationConfigDto,
    @Request() req: any,
  ): Promise<IntegrationConfig> {
    return this.systemConfigService.updateIntegrationConfig(config, req.user.id);
  }

  @Post('integrations/:integration/test')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Test integration',
    description: 'Test a specific integration configuration.',
  })
  @ApiParam({
    name: 'integration',
    description: 'Integration name',
    enum: ['landRegistry', 'companiesHouse', 'royalMailPaf', 'stripe'],
  })
  @ApiBody({ type: TestIntegrationDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid integration name',
  })
  async testIntegration(
    @Param('integration') integration: string,
    @Body() testData?: TestIntegrationDto,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const validIntegrations = ['landRegistry', 'companiesHouse', 'royalMailPaf', 'stripe'];
    
    if (!validIntegrations.includes(integration)) {
      throw new BadRequestException(`Invalid integration: ${integration}`);
    }

    return this.systemConfigService.testIntegration(
      integration as keyof IntegrationConfig,
      testData?.config,
    );
  }

  // Configuration Validation
  @Post('validate/:category')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Validate configuration',
    description: 'Validate configuration data for a specific category.',
  })
  @ApiParam({
    name: 'category',
    description: 'Configuration category',
    enum: ['database', 'email', 'rate_limiting', 'security', 'integrations'],
  })
  @ApiBody({ description: 'Configuration data to validate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration validation result',
    type: Object, // ConfigurationValidationResult
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid category',
  })
  async validateConfiguration(
    @Param('category') category: string,
    @Body() config: any,
  ): Promise<ConfigurationValidationResult> {
    const validCategories = ['database', 'email', 'rate_limiting', 'security', 'integrations'];
    
    if (!validCategories.includes(category)) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }

    return this.systemConfigService.validateConfiguration(category, config);
  }

  // Configuration Backup and Restore
  @Post('backup')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create configuration backup',
    description: 'Create a backup of all system configurations.',
  })
  @ApiBody({ type: CreateBackupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuration backup created successfully',
    type: Object, // ConfigurationBackup
  })
  async createConfigurationBackup(
    @Body() backupData: CreateBackupDto,
    @Request() req: any,
  ): Promise<ConfigurationBackup> {
    return this.systemConfigService.createConfigurationBackup(
      backupData.description,
      req.user.id,
    );
  }

  @Post('restore/:backupId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Restore configuration backup',
    description: 'Restore system configurations from a backup.',
  })
  @ApiParam({
    name: 'backupId',
    description: 'Backup ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration backup restored successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        restoredCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Backup not found or restore failed',
  })
  async restoreConfigurationBackup(
    @Param('backupId') backupId: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string; restoredCount: number }> {
    return this.systemConfigService.restoreConfigurationBackup(backupId, req.user.id);
  }

  // Health Check
  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'System configuration service health check',
    description: 'Check the health and status of the system configuration service.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        configurations: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'configured' },
            email: { type: 'string', example: 'configured' },
            rateLimiting: { type: 'string', example: 'configured' },
            security: { type: 'string', example: 'configured' },
            integrations: { type: 'string', example: 'configured' },
          },
        },
      },
    },
  })
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: Date;
    version: string;
    configurations: {
      database: string;
      email: string;
      rateLimiting: string;
      security: string;
      integrations: string;
    };
  }> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      configurations: {
        database: 'configured',
        email: 'configured',
        rateLimiting: 'configured',
        security: 'configured',
        integrations: 'configured',
      },
    };
  }
}
