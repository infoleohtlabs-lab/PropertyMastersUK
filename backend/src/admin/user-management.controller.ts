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
  Request,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { UserManagementService } from './user-management.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  BulkActionDto,
  ExportUsersDto,
  RolePermissionDto,
  UserActivityAnalyticsDto,
  BulkUserOperationDto,
  UserSessionDto,
  AdvancedUserFiltersDto,
} from './dto/user-management.dto';

// Additional DTOs for enhanced functionality
class UpdateRolePermissionsDto {
  role: UserRole;
  permissions: string[];
}

class BulkOperationRequestDto {
  userIds: string[];
  operation: 'activate' | 'suspend' | 'delete' | 'verify' | 'change_role' | 'reset_password';
  data?: {
    reason?: string;
    newRole?: UserRole;
    sendNotification?: boolean;
  };
}

class UserActivityFiltersDto {
  userId: string;
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: Date;
  endDate?: Date;
}

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  // Basic User Management Operations
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  async getUsers(@Query() filters: UserFilterDto, @Request() req) {
    return this.userManagementService.getUsers(filters, req.user.id);
  }

  @Get('advanced')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get users with advanced filtering and analytics' })
  @ApiResponse({ status: 200, description: 'Advanced user data retrieved successfully' })
  async getAdvancedUsers(@Query() filters: AdvancedUserFiltersDto, @Request() req) {
    return this.userManagementService.getAdvancedUsers(filters, req.user.id);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStatistics(@Request() req) {
    return this.userManagementService.getUserStats();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.userManagementService.getUserById(id, req.user.id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.userManagementService.createUser(createUserDto, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.userManagementService.updateUser(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.userManagementService.deleteUser(id, req.user.id);
  }

  // User Status Management
  @Put(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: UserStatus; reason?: string },
    @Request() req,
  ) {
    return this.userManagementService.updateUserStatus(id, body.status, body.reason, req.user.id);
  }

  @Put(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { role: UserRole; reason?: string },
    @Request() req,
  ) {
    return this.userManagementService.updateUserRole(id, body.role, body.reason, req.user.id);
  }

  @Put(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  async verifyUser(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.userManagementService.verifyUser(id, req.user.id);
  }

  @Put(':id/unverify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Unverify user email' })
  @ApiResponse({ status: 200, description: 'User unverified successfully' })
  async unverifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.userManagementService.unverifyUser(id, body.reason, req.user.id);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetUserPassword(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.userManagementService.resetUserPassword(id, true, req.user.id);
  }

  // Enhanced Role Management
  @Get('roles/permissions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get role permissions mapping' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
  async getRolePermissions(): Promise<RolePermissionDto[]> {
    return this.userManagementService.getRolePermissions();
  }

  @Put('roles/permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiResponse({ status: 200, description: 'Role permissions updated successfully' })
  async updateRolePermissions(
    @Body() updateDto: UpdateRolePermissionsDto,
    @Request() req,
  ) {
    return this.userManagementService.updateRolePermissions(
      updateDto.role,
      updateDto.permissions,
      req.user.id,
    );
  }

  // User Activity and Analytics
  @Get(':id/activity')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req,
  ) {
    return this.userManagementService.getUserActivity(id, page, limit);
  }

  @Post('activity/analytics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user activity analytics' })
  @ApiResponse({ status: 200, description: 'User activity analytics retrieved successfully' })
  async getUserActivityAnalytics(
    @Body() filters: UserActivityAnalyticsDto,
    @Request() req,
  ) {
    return this.userManagementService.getUserActivityAnalytics(filters);
  }

  // Session Management
  @Get(':id/sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user active sessions' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully' })
  async getUserSessions(@Param('id', ParseUUIDPipe) id: string): Promise<UserSessionDto[]> {
    return this.userManagementService.getActiveSessions(id);
  }

  @Delete('sessions/:sessionId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Terminate user session' })
  @ApiResponse({ status: 200, description: 'Session terminated successfully' })
  async terminateSession(@Param('sessionId') sessionId: string, @Request() req) {
    return this.userManagementService.terminateUserSession(sessionId, req.user.id);
  }

  @Delete(':id/sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Terminate all user sessions' })
  @ApiResponse({ status: 200, description: 'All user sessions terminated successfully' })
  async terminateAllUserSessions(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.userManagementService.terminateAllUserSessions(id, req.user.id);
  }

  // Enhanced Bulk Operations
  @Post('bulk/operation')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Perform bulk operations on users' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bulk operation data' })
  async performBulkOperation(
    @Body() operation: BulkOperationRequestDto,
    @Request() req,
  ) {
    if (!operation.userIds || operation.userIds.length === 0) {
      throw new BadRequestException('User IDs are required for bulk operations');
    }

    const bulkOperation: BulkUserOperationDto = {
      userIds: operation.userIds,
      operation: operation.operation,
      data: operation.data,
    };

    return this.userManagementService.performBulkOperation(bulkOperation, req.user.id);
  }

  // Legacy bulk operations (maintained for backward compatibility)
  @Post('bulk/actions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Perform bulk actions on users (legacy)' })
  @ApiResponse({ status: 200, description: 'Bulk action completed successfully' })
  async performBulkActions(@Body() bulkActionDto: BulkUserOperationDto, @Request() req) {
    return this.userManagementService.performBulkOperation(bulkActionDto, req.user.id);
  }

  // Data Export
  @Post('export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export users data' })
  @ApiResponse({ status: 200, description: 'Users exported successfully' })
  async exportUsers(@Body() exportDto: ExportUsersDto, @Request() req) {
    return this.userManagementService.exportUsers(exportDto.format, exportDto.filters, req.user.id);
  }

  // Health Check and Monitoring
  @Get('health/check')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check user management system health' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async healthCheck(@Request() req) {
    const stats = await this.userManagementService.getUserStats();
    
    return {
      status: 'healthy',
      timestamp: new Date(),
      userStats: stats,
      systemInfo: {
        totalUsers: stats.total,
        activeUsers: stats.active,
        suspendedUsers: stats.suspended,
        verifiedUsers: stats.verified,
      },
    };
  }

  // Advanced Search and Filtering
  @Post('search/advanced')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Advanced user search with complex filters' })
  @ApiResponse({ status: 200, description: 'Advanced search completed successfully' })
  async advancedUserSearch(
    @Body() filters: AdvancedUserFiltersDto,
    @Request() req,
  ) {
    return this.userManagementService.getAdvancedUsers(filters, req.user.id);
  }

  // User Validation and Verification
  @Post('validate/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Validate multiple users data integrity' })
  @ApiResponse({ status: 200, description: 'User validation completed' })
  async validateUsers(
    @Body() body: { userIds: string[] },
    @Request() req,
  ) {
    const validationResults = [];
    
    for (const userId of body.userIds) {
      try {
        const user = await this.userManagementService.getUserById(userId, req.user.id);
        validationResults.push({
          userId,
          isValid: true,
          issues: [],
          user: user,
        });
      } catch (error) {
        validationResults.push({
          userId,
          isValid: false,
          issues: [error.message],
          user: null,
        });
      }
    }

    return {
      validationResults,
      summary: {
        total: body.userIds.length,
        valid: validationResults.filter(r => r.isValid).length,
        invalid: validationResults.filter(r => !r.isValid).length,
      },
    };
  }
}
