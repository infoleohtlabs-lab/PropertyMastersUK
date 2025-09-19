import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig, ConfigCategory, ConfigType, ConfigEnvironment } from './entities/system-config.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateSystemConfigDto {
  key: string;
  name: string;
  description?: string;
  category: ConfigCategory;
  type: ConfigType;
  environment?: ConfigEnvironment;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  sensitive?: boolean;
  readonly?: boolean;
  validationRules?: string;
  possibleValues?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  displayOrder?: number;
  groupName?: string;
  metadata?: Record<string, any>;
  notes?: string;
  restartRequired?: boolean;
  backupBeforeChange?: boolean;
}

export interface UpdateSystemConfigDto {
  name?: string;
  description?: string;
  value?: string;
  active?: boolean;
  required?: boolean;
  sensitive?: boolean;
  readonly?: boolean;
  validationRules?: string;
  possibleValues?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  displayOrder?: number;
  groupName?: string;
  metadata?: Record<string, any>;
  notes?: string;
  restartRequired?: boolean;
  backupBeforeChange?: boolean;
}

export interface SystemConfigFilter {
  category?: ConfigCategory;
  environment?: ConfigEnvironment;
  active?: boolean;
  required?: boolean;
  sensitive?: boolean;
  readonly?: boolean;
  groupName?: string;
  search?: string;
}

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(AdminActivityLog)
    private activityLogRepository: Repository<AdminActivityLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createConfig(
    createDto: CreateSystemConfigDto,
    userId: string,
  ): Promise<SystemConfig> {
    // Check if key already exists
    const existingConfig = await this.systemConfigRepository.findOne({
      where: { key: createDto.key },
    });

    if (existingConfig) {
      throw new BadRequestException(`Configuration with key '${createDto.key}' already exists`);
    }

    // Validate the configuration value
    if (createDto.value) {
      this.validateConfigValue(createDto.value, createDto);
    }

    const config = this.systemConfigRepository.create({
      ...createDto,
      lastModifiedBy: userId,
      lastModifiedAt: new Date(),
    });

    const savedConfig = await this.systemConfigRepository.save(config);

    // Log the activity
    await this.logActivity(
      userId,
      'CREATE_CONFIG',
      `Created system configuration: ${savedConfig.key}`,
      { configId: savedConfig.id, key: savedConfig.key },
    );

    // Emit event
    this.eventEmitter.emit('config.created', {
      config: savedConfig,
      userId,
    });

    return savedConfig;
  }

  async updateConfig(
    id: string,
    updateDto: UpdateSystemConfigDto,
    userId: string,
  ): Promise<SystemConfig> {
    const config = await this.systemConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    if (config.readonly) {
      throw new BadRequestException('Cannot update readonly configuration');
    }

    // Backup current value if required
    if (config.backupBeforeChange && updateDto.value && updateDto.value !== config.value) {
      await this.createConfigBackup(config, userId);
    }

    // Validate the new value
    if (updateDto.value !== undefined) {
      this.validateConfigValue(updateDto.value, config);
    }

    const oldValue = config.value;
    const updatedConfig = await this.systemConfigRepository.save({
      ...config,
      ...updateDto,
      lastModifiedBy: userId,
      lastModifiedAt: new Date(),
      version: config.version + 1,
    });

    // Log the activity
    await this.logActivity(
      userId,
      'UPDATE_CONFIG',
      `Updated system configuration: ${config.key}`,
      {
        configId: config.id,
        key: config.key,
        oldValue: config.sensitive ? '[REDACTED]' : oldValue,
        newValue: config.sensitive ? '[REDACTED]' : updateDto.value,
      },
    );

    // Emit event
    this.eventEmitter.emit('config.updated', {
      config: updatedConfig,
      oldValue,
      userId,
    });

    return updatedConfig;
  }

  async getConfigs(filter?: SystemConfigFilter): Promise<SystemConfig[]> {
    const queryBuilder = this.systemConfigRepository.createQueryBuilder('config');

    if (filter?.category) {
      queryBuilder.andWhere('config.category = :category', { category: filter.category });
    }

    if (filter?.environment) {
      queryBuilder.andWhere('config.environment = :environment', { environment: filter.environment });
    }

    if (filter?.active !== undefined) {
      queryBuilder.andWhere('config.active = :active', { active: filter.active });
    }

    if (filter?.required !== undefined) {
      queryBuilder.andWhere('config.required = :required', { required: filter.required });
    }

    if (filter?.sensitive !== undefined) {
      queryBuilder.andWhere('config.sensitive = :sensitive', { sensitive: filter.sensitive });
    }

    if (filter?.readonly !== undefined) {
      queryBuilder.andWhere('config.readonly = :readonly', { readonly: filter.readonly });
    }

    if (filter?.groupName) {
      queryBuilder.andWhere('config.groupName = :groupName', { groupName: filter.groupName });
    }

    if (filter?.search) {
      queryBuilder.andWhere(
        '(config.key ILIKE :search OR config.name ILIKE :search OR config.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    queryBuilder.orderBy('config.displayOrder', 'ASC')
      .addOrderBy('config.groupName', 'ASC')
      .addOrderBy('config.name', 'ASC');

    const configs = await queryBuilder.getMany();

    // Mask sensitive values
    return configs.map(config => ({
      ...config,
      value: config.sensitive ? '[REDACTED]' : config.value,
    }));
  }

  async getConfigByKey(key: string, includeSensitive = false): Promise<SystemConfig> {
    const config = await this.systemConfigRepository.findOne({
      where: { key, active: true },
    });

    if (!config) {
      throw new NotFoundException(`Configuration with key '${key}' not found`);
    }

    if (config.sensitive && !includeSensitive) {
      config.value = '[REDACTED]';
    }

    return config;
  }

  async deleteConfig(id: string, userId: string): Promise<void> {
    const config = await this.systemConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    if (config.readonly) {
      throw new BadRequestException('Cannot delete readonly configuration');
    }

    if (config.required) {
      throw new BadRequestException('Cannot delete required configuration');
    }

    await this.systemConfigRepository.remove(config);

    // Log the activity
    await this.logActivity(
      userId,
      'DELETE_CONFIG',
      `Deleted system configuration: ${config.key}`,
      { configId: id, key: config.key },
    );

    // Emit event
    this.eventEmitter.emit('config.deleted', {
      config,
      userId,
    });
  }

  async getConfigsByCategory(category: ConfigCategory): Promise<SystemConfig[]> {
    return this.getConfigs({ category });
  }

  async validateSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      details?: any;
    }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check required configurations
    const requiredConfigs = await this.systemConfigRepository.find({
      where: { required: true, active: true },
    });

    const missingConfigs = requiredConfigs.filter(config => !config.value);
    if (missingConfigs.length > 0) {
      checks.push({
        name: 'Required Configurations',
        status: 'fail',
        message: `${missingConfigs.length} required configurations are missing values`,
        details: missingConfigs.map(c => c.key),
      });
      overallStatus = 'critical';
    } else {
      checks.push({
        name: 'Required Configurations',
        status: 'pass',
        message: 'All required configurations have values',
      });
    }

    // Check configuration validation
    const allConfigs = await this.systemConfigRepository.find({
      where: { active: true },
    });

    const invalidConfigs = [];
    for (const config of allConfigs) {
      if (config.value) {
        try {
          this.validateConfigValue(config.value, config);
        } catch (error) {
          invalidConfigs.push({ key: config.key, error: error.message });
        }
      }
    }

    if (invalidConfigs.length > 0) {
      checks.push({
        name: 'Configuration Validation',
        status: 'fail',
        message: `${invalidConfigs.length} configurations have invalid values`,
        details: invalidConfigs,
      });
      if (overallStatus !== 'critical') {
        overallStatus = 'warning';
      }
    } else {
      checks.push({
        name: 'Configuration Validation',
        status: 'pass',
        message: 'All configurations have valid values',
      });
    }

    return {
      status: overallStatus,
      checks,
    };
  }

  private validateConfigValue(value: string, config: Partial<SystemConfig>): void {
    if (!value && config.required) {
      throw new BadRequestException('Value is required for this configuration');
    }

    if (!value) return;

    // Type validation
    switch (config.type) {
      case ConfigType.NUMBER:
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new BadRequestException('Value must be a valid number');
        }
        if (config.minValue !== undefined && numValue < config.minValue) {
          throw new BadRequestException(`Value must be at least ${config.minValue}`);
        }
        if (config.maxValue !== undefined && numValue > config.maxValue) {
          throw new BadRequestException(`Value must be at most ${config.maxValue}`);
        }
        break;

      case ConfigType.BOOLEAN:
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          throw new BadRequestException('Value must be a valid boolean (true/false)');
        }
        break;

      case ConfigType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException('Value must be valid JSON');
        }
        break;

      case ConfigType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new BadRequestException('Value must be a valid email address');
        }
        break;

      case ConfigType.URL:
        try {
          new URL(value);
        } catch {
          throw new BadRequestException('Value must be a valid URL');
        }
        break;
    }

    // Length validation
    if (config.minLength !== undefined && value.length < config.minLength) {
      throw new BadRequestException(`Value must be at least ${config.minLength} characters`);
    }
    if (config.maxLength !== undefined && value.length > config.maxLength) {
      throw new BadRequestException(`Value must be at most ${config.maxLength} characters`);
    }

    // Pattern validation
    if (config.pattern) {
      const regex = new RegExp(config.pattern);
      if (!regex.test(value)) {
        throw new BadRequestException('Value does not match the required pattern');
      }
    }

    // Possible values validation
    if (config.possibleValues) {
      try {
        const possibleValues = JSON.parse(config.possibleValues);
        if (Array.isArray(possibleValues) && !possibleValues.includes(value)) {
          throw new BadRequestException(`Value must be one of: ${possibleValues.join(', ')}`);
        }
      } catch {
        // Ignore if possibleValues is not valid JSON
      }
    }
  }

  private async createConfigBackup(config: SystemConfig, userId: string): Promise<void> {
    const backupKey = `${config.key}_backup_${Date.now()}`;
    const backupConfig = this.systemConfigRepository.create({
      key: backupKey,
      name: `Backup of ${config.name}`,
      description: `Automatic backup created before updating ${config.key}`,
      category: config.category,
      type: config.type,
      environment: config.environment,
      value: config.value,
      active: false,
      readonly: true,
      metadata: {
        originalConfigId: config.id,
        originalKey: config.key,
        backupReason: 'pre_update',
        backupDate: new Date().toISOString(),
      },
      lastModifiedBy: userId,
      lastModifiedAt: new Date(),
    });

    await this.systemConfigRepository.save(backupConfig);
  }

  private async logActivity(
    userId: string,
    action: string,
    description: string,
    details?: Record<string, any>,
  ): Promise<void> {
    const log = this.activityLogRepository.create({
      userId,
      action,
      details: details ? JSON.stringify(details) : description,
      createdAt: new Date(),
    });

    await this.activityLogRepository.save(log);
  }
}
