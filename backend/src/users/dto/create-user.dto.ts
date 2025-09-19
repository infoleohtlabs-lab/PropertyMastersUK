import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Valid email address for user account and communications',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Secure password with minimum 6 characters. Should contain letters and numbers for better security.',
    example: 'SecurePass123',
    minLength: 6,
    maxLength: 128,
    format: 'password'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128)
  password: string;

  @ApiProperty({
    description: 'User\'s first name or given name',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'User\'s last name or family name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Contact phone number in international format',
    example: '+44 7123 456789',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    maxLength: 20
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User role determining access permissions and capabilities within the system',
    enum: UserRole,
    example: UserRole.TENANT,
    enumName: 'UserRole',
    default: UserRole.TENANT
  })
  @IsEnum(UserRole, { message: 'Please provide a valid user role' })
  @IsOptional()
  role?: UserRole;
}
