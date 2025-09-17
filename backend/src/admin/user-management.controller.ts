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
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UserManagementService } from './user-management.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user-management.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: 'Filter by verification status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getUsers(
    @Query() filters: UserFilterDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.getUsers(filters, currentUser.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User statistics retrieved successfully' })
  async getUserStats() {
    return this.userManagementService.getUserStats();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export users data' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'excel'], description: 'Export format' })
  @ApiQuery({ name: 'filters', required: false, type: String, description: 'JSON string of filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users exported successfully' })
  async exportUsers(
    @Query('format') format: string = 'csv',
    @Query('filters') filters: string,
    @CurrentUser() currentUser: User,
  ) {
    const parsedFilters = filters ? JSON.parse(filters) : {};
    return this.userManagementService.exportUsers(format, parsedFilters, currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.getUserById(id, currentUser.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists' })
  async createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.createUser(createUserDto, currentUser.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.updateUser(id, updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Cannot delete this user' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.deleteUser(id, currentUser.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.updateUserStatus(id, status, reason, currentUser.id);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @Roles(UserRole.SUPER_ADMIN) // Only super admin can change roles
  @ApiResponse({ status: HttpStatus.OK, description: 'User role updated successfully' })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.updateUserRole(id, role, reason, currentUser.id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Manually verify user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User verified successfully' })
  async verifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.verifyUser(id, currentUser.id);
  }

  @Post(':id/unverify')
  @ApiOperation({ summary: 'Unverify user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User unverified successfully' })
  async unverifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.unverifyUser(id, reason, currentUser.id);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully' })
  async resetUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('sendEmail') sendEmail: boolean = true,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.resetUserPassword(id, sendEmail, currentUser.id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'User activity retrieved successfully' })
  async getUserActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.userManagementService.getUserActivity(id, page, limit);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bulk action completed successfully' })
  async bulkAction(
    @Body('userIds') userIds: string[],
    @Body('action') action: string,
    @Body('data') data: any,
    @CurrentUser() currentUser: User,
  ) {
    return this.userManagementService.bulkAction(userIds, action, data, currentUser.id);
  }
}