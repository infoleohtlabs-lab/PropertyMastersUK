import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  SystemConfigService,
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  SystemConfigFilter,
} from './system-config.service';
import { SystemConfig, ConfigCategory, ConfigEnvironment } from './entities/system-config.entity';
import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

class CreateSystemConfigRequestDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ConfigCategory)
  category: ConfigCategory;

  @IsString()
  type: string;

  @IsOptional()
  @IsEnum(ConfigEnvironment)
  environment?: ConfigEnvironment;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly?: boolean;

  @IsOptional()
  @IsString()
  validationRules?: string;

  @IsOptional()
  @IsString()
  possibleValues?: string;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  restartRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  backupBeforeChange?: boolean;
}

class UpdateSystemConfigRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly?: boolean;

  @IsOptional()
  @IsString()
  validationRules?: string;

  @IsOptional()
  @IsString()
  possibleValues?: string;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  restartRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  backupBeforeChange?: boolean;
}

class SystemConfigQueryDto {
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;

  @IsOptional()
  @IsEnum(ConfigEnvironment)
  environment?: ConfigEnvironment;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  sensitive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  readonly?: boolean;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

@ApiTags('System Configuration')
@Controller('admin/system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new system configuration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuration created successfully',
    type: SystemConfig,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data or key already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async createConfig(
    @Body(ValidationPipe) createDto: CreateSystemConfigRequestDto,
    @GetUser() user: User,
  ): Promise<SystemConfig> {
    return this.systemConfigService.createConfig(createDto as CreateSystemConfigDto, user.id);
  }

  @Get()
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({ summary: 'Get all system configurations' })
  @ApiQuery({ name: 'category', enum: ConfigCategory, required: false })
  @ApiQuery({ name: 'environment', enum: ConfigEnvironment, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiQuery({ name: 'required', type: Boolean, required: false })
  @ApiQuery({ name: 'sensitive', type: Boolean, required: false })
  @ApiQuery({ name: 'readonly', type: Boolean, required: false })
  @ApiQuery({ name: 'groupName', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurations retrieved successfully',
    type: [SystemConfig],
  })
  async getConfigs(
    @Query(ValidationPipe) query: SystemConfigQueryDto,
  ): Promise<SystemConfig[]> {
    return this.systemConfigService.getConfigs(query as SystemConfigFilter);
  }

  @Get('categories/:category')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({ summary: 'Get configurations by category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurations retrieved successfully',
    type: [SystemConfig],
  })
  async getConfigsByCategory(
    @Param('category') category: ConfigCategory,
  ): Promise<SystemConfig[]> {
    return this.systemConfigService.getConfigsByCategory(category);
  }

  @Get('key/:key')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({ summary: 'Get configuration by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration retrieved successfully',
    type: SystemConfig,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuration not found',
  })
  async getConfigByKey(
    @Param('key') key: string,
    @Query('includeSensitive') includeSensitive?: boolean,
  ): Promise<SystemConfig> {
    return this.systemConfigService.getConfigByKey(key, includeSensitive);
  }

  @Get('health')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Validate system configuration health' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System health check completed',
  })
  async validateSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      details?: any;
    }>;
  }> {
    return this.systemConfigService.validateSystemHealth();
  }

  @Get(':id')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({ summary: 'Get configuration by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration retrieved successfully',
    type: SystemConfig,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuration not found',
  })
  async getConfigById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SystemConfig> {
    return this.systemConfigService.getConfigByKey(id, false);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a system configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration updated successfully',
    type: SystemConfig,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuration not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data or readonly configuration',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateSystemConfigRequestDto,
    @GetUser() user: User,
  ): Promise<SystemConfig> {
    return this.systemConfigService.updateConfig(id, updateDto as UpdateSystemConfigDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a system configuration' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Configuration deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuration not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete readonly or required configuration',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async deleteConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.systemConfigService.deleteConfig(id, user.id);
  }

  @Post('bulk-update')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Bulk update multiple configurations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurations updated successfully',
  })
  async bulkUpdateConfigs(
    @Body() updates: Array<{ id: string; value: string }>,
    @GetUser() user: User,
  ): Promise<{ updated: number; errors: Array<{ id: string; error: string }> }> {
    const results = {
      updated: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (const update of updates) {
      try {
        await this.systemConfigService.updateConfig(
          update.id,
          { value: update.value },
          user.id,
        );
        results.updated++;
      } catch (error) {
        results.errors.push({
          id: update.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  @Post('reset/:id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Reset configuration to default value' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration reset successfully',
    type: SystemConfig,
  })
  async resetConfigToDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<SystemConfig> {
    // First get the config to find its default value
    const config = await this.systemConfigService.getConfigByKey(id, true);
    
    return this.systemConfigService.updateConfig(
      id,
      { value: config.defaultValue || '' },
      user.id,
    );
  }

  @Get('export/:category')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Export configurations by category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurations exported successfully',
  })
  async exportConfigs(
    @Param('category') category: ConfigCategory,
  ): Promise<{
    category: ConfigCategory;
    exportDate: string;
    configurations: SystemConfig[];
  }> {
    const configs = await this.systemConfigService.getConfigsByCategory(category);
    
    return {
      category,
      exportDate: new Date().toISOString(),
      configurations: configs,
    };
  }
}
