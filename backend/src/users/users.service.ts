import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryOptimizationService } from '../database/query-optimization.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private queryOptimizationService: QueryOptimizationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'isVerified', 'createdAt', 'updatedAt'],
    });
  }

  async searchUsers(searchTerm: string, tenantOrganizationId: string, page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    return this.queryOptimizationService.searchUsersOptimized(searchTerm, tenantOrganizationId, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'isVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByPasswordResetToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { passwordResetToken: token } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { emailVerificationToken: token } });
  }

  async updatePasswordResetToken(id: string, token: string, expiry: Date): Promise<void> {
    await this.usersRepository.update(id, {
      passwordResetToken: token,
      passwordResetTokenExpiry: expiry,
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
  }

  async updateEmailVerificationToken(id: string, token: string): Promise<void> {
    await this.usersRepository.update(id, {
      emailVerificationToken: token,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async deactivateUser(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: false });
  }

  async activateUser(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: true });
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.usersRepository.increment({ id }, 'failedLoginAttempts', 1);
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      failedLoginAttempts: 0,
      isAccountLocked: false,
      accountLockedUntil: null,
    });
  }

  async lockAccount(id: string, lockDurationMinutes: number = 30): Promise<void> {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + lockDurationMinutes);
    
    await this.usersRepository.update(id, {
      isAccountLocked: true,
      accountLockedUntil: lockUntil,
    });
  }

  async unlockAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      isAccountLocked: false,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
    });
  }

  async isAccountLocked(user: User): Promise<boolean> {
    if (!user.isAccountLocked) {
      return false;
    }

    // Check if lock period has expired
    if (user.accountLockedUntil && new Date() > user.accountLockedUntil) {
      // Auto-unlock expired accounts
      await this.unlockAccount(user.id);
      return false;
    }

    return true;
  }
}
