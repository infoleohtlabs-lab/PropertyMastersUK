import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserFilterDto,
  RolePermissionDto,
  UserActivityAnalyticsDto,
  BulkUserOperationDto,
  UserSessionDto,
  AdvancedUserFiltersDto
} from './dto/user-management.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Enhanced DTOs are now imported from dto file

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AdminActivityLog)
    private readonly activityLogRepository: Repository<AdminActivityLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getUsers(filters: UserFilterDto, adminId: string) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Apply verification filter
    if (verified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :verified', { verified });
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_LIST_VIEWED',
      `Viewed user list with filters: ${JSON.stringify(filters)}`,
    );

    return {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters,
    };
  }

  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const verifiedUsers = await this.userRepository.count({
      where: { isEmailVerified: true },
    });
    const suspendedUsers = await this.userRepository.count({
      where: { status: UserStatus.SUSPENDED },
    });

    // Users by role
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await this.userRepository.count({
      where: {
        createdAt: thirtyDaysAgo,
      },
    });

    // Users by status
    const usersByStatus = await this.userRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      suspended: suspendedUsers,
      recentRegistrations,
      byRole: usersByRole,
      byStatus: usersByStatus,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
    };
  }

  async getUserById(id: string, adminId: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['properties', 'bookings'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    // Log activity
    await this.logActivity(
      adminId,
      'USER_VIEWED',
      `Viewed user details for ${user.email}`,
      null,
      null,
      'user',
      user.id,
    );

    return userWithoutPassword;
  }

  async createUser(createUserDto: CreateUserDto, adminId: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: createUserDto.isEmailVerified || false,
      status: createUserDto.status || UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;

    // Log activity
    await this.logActivity(
      adminId,
      'USER_CREATED',
      `Created new user: ${user.email} with role: ${user.role}`,
      null,
      null,
      'user',
      user.id,
    );

    return userWithoutPassword;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    // Log activity
    await this.logActivity(
      adminId,
      'USER_UPDATED',
      `Updated user: ${user.email}. Changes: ${JSON.stringify(updateUserDto)}`,
      null,
      null,
      'user',
      user.id,
    );

    return userWithoutPassword;
  }

  async deleteUser(id: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of super admin or self
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete super admin user');
    }

    if (user.id === adminId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Soft delete by updating status
    await this.userRepository.update(id, {
      status: UserStatus.DELETED,
      email: `deleted_${Date.now()}_${user.email}`,
    });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_DELETED',
      `Deleted user: ${user.email}`,
      null,
      null,
      'user',
      user.id,
    );

    return { message: 'User deleted successfully' };
  }

  async updateUserStatus(id: string, status: string, reason: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      throw new BadRequestException('Invalid status');
    }

    await this.userRepository.update(id, { status: status as UserStatus });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_STATUS_CHANGED',
      `Changed user status for ${user.email} to ${status}. Reason: ${reason}`,
      null,
      null,
      'user',
      user.id,
    );

    return { message: 'User status updated successfully' };
  }

  async updateUserRole(id: string, role: UserRole, reason: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    await this.userRepository.update(id, { role });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_ROLE_CHANGED',
      `Changed user role for ${user.email} from ${user.role} to ${role}. Reason: ${reason}`,
      null,
      null,
      'user',
      user.id,
    );

    return { message: 'User role updated successfully' };
  }

  async verifyUser(id: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, {
      isEmailVerified: true
    });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_VERIFIED',
      `Manually verified user: ${user.email}`,
      null,
      null,
      'user',
      user.id,
    );

    return { message: 'User verified successfully' };
  }

  async unverifyUser(id: string, reason: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, {
      isEmailVerified: false
    });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_UNVERIFIED',
      `Unverified user: ${user.email}. Reason: ${reason}`,
      null,
      null,
      'user',
      user.id,
    );

    return { message: 'User unverified successfully' };
  }

  async resetUserPassword(id: string, sendEmail: boolean, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.userRepository.update(id, {
      password: hashedPassword,
    });

    // Log activity
    await this.logActivity(
      adminId,
      'USER_PASSWORD_RESET',
      `Reset password for user: ${user.email}`,
      null,
      null,
      'user',
      user.id,
    );

    // In production, send email with temporary password
    if (sendEmail) {
      // TODO: Implement email service
      this.logger.log(`Temporary password for ${user.email}: ${tempPassword}`);
    }

    return {
      message: 'Password reset successfully',
      temporaryPassword: sendEmail ? undefined : tempPassword,
    };
  }

  async getUserActivity(id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [activities, total] = await this.activityLogRepository.findAndCount({
      where: { userId: id },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async bulkAction(userIds: string[], action: string, data: any, adminId: string) {
    const users = await this.userRepository.findBy({ id: In(userIds) });

    if (users.length !== userIds.length) {
      throw new BadRequestException('Some users not found');
    }

    let result;
    switch (action) {
      case 'delete':
        result = await this.bulkDelete(userIds, adminId);
        break;
      case 'suspend':
        result = await this.bulkUpdateStatus(userIds, UserStatus.SUSPENDED, data.reason, adminId);
        break;
      case 'activate':
        result = await this.bulkUpdateStatus(userIds, UserStatus.ACTIVE, data.reason, adminId);
        break;
      case 'verify':
        result = await this.bulkVerify(userIds, adminId);
        break;
      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return result;
  }

  async exportUsers(format: string, filters: any, adminId: string) {
    // Get users based on filters
    const users = await this.getUsers({ ...filters, limit: 10000 }, adminId);

    // Log activity
    await this.logActivity(
      adminId,
      'USERS_EXPORTED',
      `Exported ${users.users.length} users in ${format} format`,
    );

    // In production, generate actual file
    return {
      message: 'Export initiated',
      format,
      count: users.users.length,
      downloadUrl: `/admin/users/download/${Date.now()}.${format}`,
    };
  }

  private async bulkDelete(userIds: string[], adminId: string) {
    await this.userRepository.update(
      { id: In(userIds) },
      { status: UserStatus.DELETED },
    );

    await this.logActivity(
      adminId,
      'BULK_USER_DELETE',
      `Bulk deleted ${userIds.length} users`,
    );

    return { message: `${userIds.length} users deleted successfully` };
  }

  private async bulkUpdateStatus(userIds: string[], status: UserStatus, reason: string, adminId: string) {
    await this.userRepository.update(
      { id: In(userIds) },
      { status },
    );

    await this.logActivity(
      adminId,
      'BULK_USER_STATUS_UPDATE',
      `Bulk updated status to ${status} for ${userIds.length} users. Reason: ${reason}`,
    );

    return { message: `${userIds.length} users status updated successfully` };
  }

  private async bulkVerify(userIds: string[], adminId: string) {
    await this.userRepository.update(
      { id: In(userIds) },
      { isEmailVerified: true }
    );

    await this.logActivity(
      adminId,
      'BULK_USER_VERIFY',
      `Bulk verified ${userIds.length} users`,
    );

    return { message: `${userIds.length} users verified successfully` };
  }

  // Enhanced Role Management
  async getRolePermissions(): Promise<RolePermissionDto[]> {
    // Define role permissions mapping
    const rolePermissions: RolePermissionDto[] = [
      {
        role: UserRole.SUPER_ADMIN,
        permissions: [
          'user.create', 'user.read', 'user.update', 'user.delete',
          'property.create', 'property.read', 'property.update', 'property.delete',
          'booking.create', 'booking.read', 'booking.update', 'booking.delete',
          'admin.access', 'system.config', 'backup.manage', 'audit.view',
          'financial.manage', 'market.analyze', 'gdpr.manage'
        ],
        description: 'Full system access with all permissions',
        isActive: true,
      },
      {
        role: UserRole.ADMIN,
        permissions: [
          'user.read', 'user.update', 'property.create', 'property.read',
          'property.update', 'booking.read', 'booking.update', 'admin.access',
          'financial.view', 'market.view'
        ],
        description: 'Administrative access with limited system permissions',
        isActive: true,
      },
      {
        role: UserRole.MANAGER,
        permissions: [
          'user.read', 'property.read', 'property.update', 'booking.read',
          'booking.update', 'financial.view'
        ],
        description: 'Management access for properties and bookings',
        isActive: true,
      },
      {
        role: UserRole.AGENT,
        permissions: [
          'property.create', 'property.read', 'property.update',
          'booking.create', 'booking.read', 'booking.update'
        ],
        description: 'Agent access for property and booking management',
        isActive: true,
      },
      {
        role: UserRole.USER,
        permissions: ['property.read', 'booking.create', 'booking.read'],
        description: 'Basic user access for viewing and booking properties',
        isActive: true,
      },
    ];

    return rolePermissions;
  }

  async updateRolePermissions(role: UserRole, permissions: string[], adminId: string): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would update a role_permissions table
    // For now, we'll log the activity
    await this.logActivity(
      adminId,
      'ROLE_PERMISSIONS_UPDATED',
      `Updated permissions for role ${role}: ${permissions.join(', ')}`,
    );

    this.eventEmitter.emit('role.permissions.updated', {
      role,
      permissions,
      updatedBy: adminId,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `Permissions updated for role ${role}`,
    };
  }

  // Advanced User Analytics
  async getUserActivityAnalytics(filters: UserActivityAnalyticsDto): Promise<any> {
    const { userId, period, startDate, endDate } = filters;
    
    let dateRange: { start: Date; end: Date };
    const now = new Date();
    
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate };
    } else {
      switch (period) {
        case 'day':
          dateRange = {
            start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            end: now,
          };
          break;
        case 'week':
          dateRange = {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: now,
          };
          break;
        case 'month':
          dateRange = {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: now,
          };
          break;
        case 'year':
          dateRange = {
            start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
            end: now,
          };
          break;
      }
    }

    const activities = await this.activityLogRepository.find({
      where: {
        userId,
        createdAt: Between(dateRange.start, dateRange.end),
      },
      order: { createdAt: 'DESC' },
    });

    // Analyze activity patterns
    const activityByAction = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});

    const activityByHour = activities.reduce((acc, activity) => {
      const hour = activity.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const activityByDay = activities.reduce((acc, activity) => {
      const day = activity.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {
      period,
      dateRange,
      totalActivities: activities.length,
      activityByAction,
      activityByHour,
      activityByDay,
      mostActiveHour: Object.keys(activityByHour).reduce((a, b) => 
        activityByHour[a] > activityByHour[b] ? a : b, '0'
      ),
      averageActivitiesPerDay: activities.length / Math.max(1, 
        Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000))
      ),
    };
  }

  // Enhanced Bulk Operations
  async performBulkOperation(operation: BulkUserOperationDto, adminId: string): Promise<any> {
    const { userIds, operation: op, data } = operation;
    
    const users = await this.userRepository.findBy({ id: In(userIds) });
    if (users.length !== userIds.length) {
      throw new BadRequestException('Some users not found');
    }

    let result;
    switch (op) {
      case 'activate':
        result = await this.bulkUpdateStatus(userIds, UserStatus.ACTIVE, data?.reason || 'Bulk activation', adminId);
        break;
      case 'suspend':
        result = await this.bulkUpdateStatus(userIds, UserStatus.SUSPENDED, data?.reason || 'Bulk suspension', adminId);
        break;
      case 'delete':
        result = await this.bulkDelete(userIds, adminId);
        break;
      case 'verify':
        result = await this.bulkVerify(userIds, adminId);
        break;
      case 'change_role':
        if (!data?.newRole) {
          throw new BadRequestException('New role is required for role change operation');
        }
        result = await this.bulkChangeRole(userIds, data.newRole, data.reason || 'Bulk role change', adminId);
        break;
      case 'reset_password':
        result = await this.bulkResetPassword(userIds, data?.sendNotification || false, adminId);
        break;
      default:
        throw new BadRequestException('Invalid bulk operation');
    }

    // Emit event for bulk operation
    this.eventEmitter.emit('users.bulk.operation', {
      operation: op,
      userIds,
      performedBy: adminId,
      timestamp: new Date(),
      result,
    });

    return result;
  }

  // User Session Management
  async getActiveSessions(userId?: string): Promise<UserSessionDto[]> {
    // In a real implementation, this would query a sessions table
    // For now, return mock data
    const mockSessions: UserSessionDto[] = [
      {
        userId: userId || 'user-1',
        sessionId: 'session-1',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        isActive: true,
      },
    ];

    return mockSessions;
  }

  async terminateUserSession(sessionId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would invalidate the session
    await this.logActivity(
      adminId,
      'SESSION_TERMINATED',
      `Terminated user session: ${sessionId}`,
    );

    return {
      success: true,
      message: 'Session terminated successfully',
    };
  }

  async terminateAllUserSessions(userId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would invalidate all user sessions
    await this.logActivity(
      adminId,
      'ALL_SESSIONS_TERMINATED',
      `Terminated all sessions for user: ${userId}`,
    );

    return {
      success: true,
      message: 'All user sessions terminated successfully',
    };
  }

  // Advanced User Search and Filtering
  async getAdvancedUsers(filters: AdvancedUserFiltersDto, adminId: string) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      verified,
      registrationDateFrom,
      registrationDateTo,
      lastLoginFrom,
      lastLoginTo,
      hasProperties,
      hasBookings,
      activityLevel,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.properties', 'properties')
      .leftJoinAndSelect('user.bookings', 'bookings');

    // Apply existing filters
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (verified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :verified', { verified });
    }

    // Apply advanced filters
    if (registrationDateFrom) {
      queryBuilder.andWhere('user.createdAt >= :regFrom', { regFrom: registrationDateFrom });
    }

    if (registrationDateTo) {
      queryBuilder.andWhere('user.createdAt <= :regTo', { regTo: registrationDateTo });
    }

    if (lastLoginFrom) {
      queryBuilder.andWhere('user.lastLoginAt >= :loginFrom', { loginFrom: lastLoginFrom });
    }

    if (lastLoginTo) {
      queryBuilder.andWhere('user.lastLoginAt <= :loginTo', { loginTo: lastLoginTo });
    }

    if (hasProperties !== undefined) {
      if (hasProperties) {
        queryBuilder.andWhere('properties.id IS NOT NULL');
      } else {
        queryBuilder.andWhere('properties.id IS NULL');
      }
    }

    if (hasBookings !== undefined) {
      if (hasBookings) {
        queryBuilder.andWhere('bookings.id IS NOT NULL');
      } else {
        queryBuilder.andWhere('bookings.id IS NULL');
      }
    }

    // Activity level filtering would require additional logic
    // For now, we'll skip this complex filter

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove sensitive data and add computed fields
    const enhancedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        propertiesCount: user.properties?.length || 0,
        bookingsCount: user.bookings?.length || 0,
        accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        lastLoginDaysAgo: user.lastLoginAt 
          ? Math.floor((Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      };
    });

    // Log activity
    await this.logActivity(
      adminId,
      'ADVANCED_USER_SEARCH',
      `Performed advanced user search with filters: ${JSON.stringify(filters)}`,
    );

    return {
      users: enhancedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters,
    };
  }

  // Additional bulk operation methods
  private async bulkChangeRole(userIds: string[], newRole: UserRole, reason: string, adminId: string) {
    await this.userRepository.update(
      { id: In(userIds) },
      { role: newRole },
    );

    await this.logActivity(
      adminId,
      'BULK_USER_ROLE_CHANGE',
      `Bulk changed role to ${newRole} for ${userIds.length} users. Reason: ${reason}`,
    );

    return { message: `${userIds.length} users role updated to ${newRole} successfully` };
  }

  private async bulkResetPassword(userIds: string[], sendNotification: boolean, adminId: string) {
    const tempPasswords = [];
    
    for (const userId of userIds) {
      const tempPassword = crypto.randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      await this.userRepository.update(userId, { password: hashedPassword });
      
      if (!sendNotification) {
        tempPasswords.push({ userId, tempPassword });
      }
    }

    await this.logActivity(
      adminId,
      'BULK_PASSWORD_RESET',
      `Bulk reset passwords for ${userIds.length} users`,
    );

    return {
      message: `${userIds.length} user passwords reset successfully`,
      temporaryPasswords: sendNotification ? undefined : tempPasswords,
    };
  }

  private async logActivity(
    userId: string,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
    resourceType?: string,
    resourceId?: string,
  ) {
    const activity = this.activityLogRepository.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      category: 'user_management',
    });

    await this.activityLogRepository.save(activity);
  }
}
