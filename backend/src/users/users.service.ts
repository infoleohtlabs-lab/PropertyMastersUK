import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
}