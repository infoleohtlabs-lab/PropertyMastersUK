import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { SecurityConfigService } from './config/security.config';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { RolesGuard } from './guards/roles.guard';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { AuthMiddleware } from './middleware/auth.middleware';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    SecurityConfigService,
    PasswordService,
    TokenService,
    RolesGuard,
    TenantAuthGuard,
    RateLimitGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    SecurityConfigService,
    PasswordService,
    TokenService,
    RolesGuard,
    TenantAuthGuard,
    RateLimitGuard,
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {}
