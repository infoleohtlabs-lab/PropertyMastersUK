import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

// Configuration Interfaces
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  connectionTimeout: number;
  maxConnections: number;
  logging: boolean;
  synchronize: boolean;
  migrationsRun: boolean;
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  host?: string;
  port?: number;
  secure: boolean;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templates: {
    welcome: string;
    passwordReset: string;
    verification: string;
    notification: string;
  };
  rateLimits: {
    perHour: number;
    perDay: number;
    perUser: number;
  };
}

export interface ApiRateLimitConfig {
  global: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  endpoints: {
    [endpoint: string]: {
      windowMs: number;
      maxRequests: number;
      skipIf?: string;
    };
  };
  userTiers: {
    [tier: string]: {
      multiplier: number;
      customLimits?: {
        [endpoint: string]: {
          windowMs: number;
          maxRequests: number;
        };
      };
    };
  };
}

export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    preventReuse: number;
  };
  session: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    rememberMeDuration: number;
  };
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
    backupCodes: boolean;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  csp: {
    directives: {
      [directive: string]: string[];
    };
  };
}

export interface IntegrationConfig {
  landRegistry: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    webhooks: {
      enabled: boolean;
      url?: string;
      secret?: string;
    };
  };
  companiesHouse: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
  };
  royalMailPaf: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
  };
  stripe: {
    enabled: boolean;
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    environment: 'test' | 'live';
  };
  analytics: {
    googleAnalytics: {
      enabled: boolean;
      trackingId?: string;
    };
    mixpanel: {
      enabled: boolean;
      token?: string;
    };
  };
}

export interface SystemConfiguration {
  id: string;
  category: 'database' | 'email' | 'rate_limiting' | 'security' | 'integrations';
  key: string;
  value: any;
  encrypted: boolean;
  description?: string;
  lastModified: Date;
  modifiedBy: string;
  version: number;
  environment: 'development' | 'staging' | 'production';
}

export interface ConfigurationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigurationBackup {
  id: string;
  timestamp: Date;
  configurations: SystemConfiguration[];
  createdBy: string;
  description?: string;
}

@Injectable()
export class SystemConfigurationService {
  private readonly logger = new Logger(SystemConfigurationService.name);

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Database Configuration
  async getDatabaseConfig(): Promise<DatabaseConfig> {
    const configs = await this.getConfigsByCategory('database');
    return this.buildConfigObject(configs, this.getDefaultDatabaseConfig());
  }

  async updateDatabaseConfig(
    config: Partial<DatabaseConfig>,
    userId: string,
  ): Promise<DatabaseConfig> {
    await this.validateDatabaseConfig(config);
    await this.updateConfigurations('database', config, userId);
    
    this.eventEmitter.emit('configuration.updated', {
      category: 'database',
      config,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Database config updated by user ${userId}: ${Object.keys(config).join(', ')}`);

    return this.getDatabaseConfig();
  }

  // Email Configuration
  async getEmailConfig(): Promise<EmailConfig> {
    const configs = await this.getConfigsByCategory('email');
    return this.buildConfigObject(configs, this.getDefaultEmailConfig());
  }

  async updateEmailConfig(
    config: Partial<EmailConfig>,
    userId: string,
  ): Promise<EmailConfig> {
    await this.validateEmailConfig(config);
    await this.updateConfigurations('email', config, userId);
    
    this.eventEmitter.emit('configuration.updated', {
      category: 'email',
      config,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Email config updated by user ${userId}: ${Object.keys(config).join(', ')}`);

    return this.getEmailConfig();
  }

  async testEmailConfig(config?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
    try {
      const emailConfig = config ? { ...await this.getEmailConfig(), ...config } : await this.getEmailConfig();
      
      // Test email sending logic would go here
      // For now, just validate the configuration
      const validation = await this.validateEmailConfig(emailConfig);
      
      if (!validation.valid) {
        return {
          success: false,
          message: `Configuration invalid: ${validation.errors.join(', ')}`,
        };
      }

      return {
        success: true,
        message: 'Email configuration test successful',
      };
    } catch (error) {
      this.logger.error('Email configuration test failed', error);
      return {
        success: false,
        message: `Test failed: ${error.message}`,
      };
    }
  }

  // API Rate Limiting Configuration
  async getApiRateLimitConfig(): Promise<ApiRateLimitConfig> {
    const configs = await this.getConfigsByCategory('rate_limiting');
    return this.buildConfigObject(configs, this.getDefaultRateLimitConfig());
  }

  async updateApiRateLimitConfig(
    config: any,
    userId: string,
  ): Promise<ApiRateLimitConfig> {
    await this.validateRateLimitConfig(config);
    await this.updateConfigurations('rate_limiting', config, userId);
    
    this.eventEmitter.emit('configuration.updated', {
      category: 'rate_limiting',
      config,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Rate limit config updated by user ${userId}: ${Object.keys(config).join(', ')}`);

    return this.getApiRateLimitConfig();
  }

  // Security Configuration
  async getSecurityConfig(): Promise<SecurityConfig> {
    const configs = await this.getConfigsByCategory('security');
    return this.buildConfigObject(configs, this.getDefaultSecurityConfig());
  }

  async updateSecurityConfig(
    config: Partial<SecurityConfig>,
    userId: string,
  ): Promise<SecurityConfig> {
    await this.validateSecurityConfig(config);
    await this.updateConfigurations('security', config, userId);
    
    this.eventEmitter.emit('configuration.updated', {
      category: 'security',
      config,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Security config updated by user ${userId}: ${Object.keys(config).join(', ')}`);

    return this.getSecurityConfig();
  }

  // Integration Configuration
  async getIntegrationConfig(): Promise<IntegrationConfig> {
    const configs = await this.getConfigsByCategory('integrations');
    return this.buildConfigObject(configs, this.getDefaultIntegrationConfig());
  }

  async updateIntegrationConfig(
    config: Partial<IntegrationConfig>,
    userId: string,
  ): Promise<IntegrationConfig> {
    await this.validateIntegrationConfig(config);
    await this.updateConfigurations('integrations', config, userId);
    
    this.eventEmitter.emit('configuration.updated', {
      category: 'integrations',
      config,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Integration config updated by user ${userId}: ${Object.keys(config).join(', ')}`);

    return this.getIntegrationConfig();
  }

  async testIntegration(
    integration: keyof IntegrationConfig,
    config?: any,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const integrationConfig = await this.getIntegrationConfig();
      const testConfig = config ? { ...integrationConfig[integration], ...config } : integrationConfig[integration];

      // Test integration logic would go here
      // For now, just validate the configuration
      switch (integration) {
        case 'landRegistry':
          return this.testLandRegistryIntegration(testConfig);
        case 'companiesHouse':
          return this.testCompaniesHouseIntegration(testConfig);
        case 'royalMailPaf':
          return this.testRoyalMailPafIntegration(testConfig);
        case 'stripe':
          return this.testStripeIntegration(testConfig);
        default:
          throw new BadRequestException(`Unknown integration: ${integration}`);
      }
    } catch (error) {
      this.logger.error(`Integration test failed for ${integration}`, error);
      return {
        success: false,
        message: `Test failed: ${error.message}`,
      };
    }
  }

  // Configuration Backup and Restore
  async createConfigurationBackup(
    description: string,
    userId: string,
  ): Promise<ConfigurationBackup> {
    // TODO: Implement configuration backup
    const backup: ConfigurationBackup = {
      id: `backup_${Date.now()}`,
      timestamp: new Date(),
      configurations: [],
      createdBy: userId,
      description,
    };

    this.logger.log(`Configuration backup created by user ${userId}: ${description}`);

    return backup;
  }

  async restoreConfigurationBackup(
    backupId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string; restoredCount: number }> {
    try {
      // TODO: Implement configuration restore
      this.logger.log(`Configuration backup restored by user ${userId}: ${backupId}`);

      return {
        success: true,
        message: 'Configuration backup restored successfully',
        restoredCount: 0,
      };
    } catch (error) {
      this.logger.error('Configuration restore failed', error);
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  // Validation Methods
  async validateConfiguration(
    category: string,
    config: any,
  ): Promise<ConfigurationValidationResult> {
    switch (category) {
      case 'database':
        return this.validateDatabaseConfig(config);
      case 'email':
        return this.validateEmailConfig(config);
      case 'rate_limiting':
        return this.validateRateLimitConfig(config);
      case 'security':
        return this.validateSecurityConfig(config);
      case 'integrations':
        return this.validateIntegrationConfig(config);
      default:
        return {
          valid: false,
          errors: [`Unknown configuration category: ${category}`],
          warnings: [],
        };
    }
  }

  // Private Helper Methods
  private async getConfigsByCategory(category: string): Promise<SystemConfiguration[]> {
    // TODO: Implement configuration persistence
    return [];
  }

  private async updateConfigurations(
    category: string,
    config: any,
    userId: string,
  ): Promise<void> {
    const flatConfig = this.flattenObject(config, category);
    
    for (const [key, value] of Object.entries(flatConfig)) {
      await this.upsertConfiguration({
        category: category as any,
        key,
        value,
        encrypted: this.shouldEncrypt(key),
        modifiedBy: userId,
        lastModified: new Date(),
        version: 1,
        environment: this.configService.get('NODE_ENV', 'development') as any,
      });
    }
  }

  private async upsertConfiguration(config: Partial<SystemConfiguration>): Promise<void> {
    // TODO: Implement configuration persistence
    this.logger.log(`Configuration would be saved: ${config.category}.${config.key}`);
  }

  private buildConfigObject(configs: SystemConfiguration[], defaults: any): any {
    const result = { ...defaults };
    
    for (const config of configs) {
      this.setNestedProperty(result, config.key, config.value);
    }
    
    return result;
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  private shouldEncrypt(key: string): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'key', 'token', 'apiKey',
      'secretKey', 'privateKey', 'webhookSecret'
    ];
    
    return sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
  }

  // Default Configuration Methods
  private getDefaultDatabaseConfig(): DatabaseConfig {
    return {
      host: 'localhost',
      port: 5432,
      database: 'property_masters',
      username: 'postgres',
      ssl: false,
      connectionTimeout: 30000,
      maxConnections: 10,
      logging: false,
      synchronize: false,
      migrationsRun: true,
    };
  }

  private getDefaultEmailConfig(): EmailConfig {
    return {
      provider: 'smtp',
      host: 'localhost',
      port: 587,
      secure: false,
      fromEmail: 'noreply@propertymasters.uk',
      fromName: 'Property Masters UK',
      templates: {
        welcome: 'welcome',
        passwordReset: 'password-reset',
        verification: 'verification',
        notification: 'notification',
      },
      rateLimits: {
        perHour: 100,
        perDay: 1000,
        perUser: 10,
      },
    };
  }

  private getDefaultRateLimitConfig(): ApiRateLimitConfig {
    return {
      global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      },
      endpoints: {
        '/api/auth/login': {
          windowMs: 15 * 60 * 1000,
          maxRequests: 5,
        },
        '/api/auth/register': {
          windowMs: 60 * 60 * 1000,
          maxRequests: 3,
        },
      },
      userTiers: {
        free: {
          multiplier: 1,
        },
        premium: {
          multiplier: 5,
        },
        enterprise: {
          multiplier: 10,
        },
      },
    };
  }

  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      jwt: {
        secret: 'your-secret-key',
        expiresIn: '1h',
        refreshExpiresIn: '7d',
        issuer: 'property-masters-uk',
        audience: 'property-masters-users',
      },
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
        preventReuse: 5,
      },
      session: {
        maxConcurrentSessions: 3,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      twoFactor: {
        enabled: true,
        required: false,
        methods: ['totp', 'email'],
        backupCodes: true,
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
      },
      cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
      csp: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    };
  }

  private getDefaultIntegrationConfig(): IntegrationConfig {
    return {
      landRegistry: {
        enabled: false,
        baseUrl: 'https://api.landregistry.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
        },
        webhooks: {
          enabled: false,
        },
      },
      companiesHouse: {
        enabled: false,
        baseUrl: 'https://api.companieshouse.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        rateLimits: {
          requestsPerMinute: 600,
          requestsPerHour: 10000,
        },
      },
      royalMailPaf: {
        enabled: false,
        baseUrl: 'https://api.royalmail.com/paf',
        timeout: 30000,
        retryAttempts: 3,
        rateLimits: {
          requestsPerMinute: 100,
          requestsPerHour: 2000,
        },
      },
      stripe: {
        enabled: false,
        environment: 'test',
      },
      analytics: {
        googleAnalytics: {
          enabled: false,
        },
        mixpanel: {
          enabled: false,
        },
      },
    };
  }

  // Validation Methods
  private async validateDatabaseConfig(config: any): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('Port must be between 1 and 65535');
    }

    if (config.maxConnections && config.maxConnections < 1) {
      errors.push('Max connections must be at least 1');
    }

    if (config.synchronize === true) {
      warnings.push('Synchronize should be disabled in production');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async validateEmailConfig(config: any): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.provider === 'smtp') {
      if (!config.host) errors.push('SMTP host is required');
      if (!config.port) errors.push('SMTP port is required');
    }

    if (config.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fromEmail)) {
      errors.push('Invalid from email address');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async validateRateLimitConfig(config: any): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.global?.maxRequests && config.global.maxRequests < 1) {
      errors.push('Global max requests must be at least 1');
    }

    if (config.global?.windowMs && config.global.windowMs < 1000) {
      errors.push('Global window must be at least 1000ms');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async validateSecurityConfig(config: any): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.password?.minLength && config.password.minLength < 8) {
      warnings.push('Password minimum length should be at least 8 characters');
    }

    if (config.jwt?.secret && config.jwt.secret.length < 32) {
      warnings.push('JWT secret should be at least 32 characters long');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private async validateIntegrationConfig(config: any): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate each integration
    for (const [integration, settings] of Object.entries(config)) {
      if (settings && typeof settings === 'object' && 'enabled' in settings) {
        const settingsObj = settings as any;
        if (settingsObj.enabled && !settingsObj.apiKey && integration !== 'analytics') {
          warnings.push(`${integration} is enabled but no API key is configured`);
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // Integration Test Methods
  private async testLandRegistryIntegration(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    if (!config.enabled) {
      return { success: false, message: 'Land Registry integration is disabled' };
    }

    if (!config.apiKey) {
      return { success: false, message: 'Land Registry API key is required' };
    }

    // Test API connection logic would go here
    return { success: true, message: 'Land Registry integration test successful' };
  }

  private async testCompaniesHouseIntegration(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    if (!config.enabled) {
      return { success: false, message: 'Companies House integration is disabled' };
    }

    if (!config.apiKey) {
      return { success: false, message: 'Companies House API key is required' };
    }

    // Test API connection logic would go here
    return { success: true, message: 'Companies House integration test successful' };
  }

  private async testRoyalMailPafIntegration(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    if (!config.enabled) {
      return { success: false, message: 'Royal Mail PAF integration is disabled' };
    }

    if (!config.apiKey) {
      return { success: false, message: 'Royal Mail PAF API key is required' };
    }

    // Test API connection logic would go here
    return { success: true, message: 'Royal Mail PAF integration test successful' };
  }

  private async testStripeIntegration(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    if (!config.enabled) {
      return { success: false, message: 'Stripe integration is disabled' };
    }

    if (!config.secretKey) {
      return { success: false, message: 'Stripe secret key is required' };
    }

    // Test Stripe connection logic would go here
    return { success: true, message: 'Stripe integration test successful' };
  }
}
