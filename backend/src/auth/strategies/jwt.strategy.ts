import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TokenService } from '../services/token.service';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID for token tracking
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    // Check if token is revoked
    if (payload.jti && await this.tokenService.isTokenRevoked(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Validate user exists and is active
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Check if email is verified for certain operations
    if (!user.isEmailVerified && this.requiresEmailVerification(req)) {
      throw new UnauthorizedException('Email verification required');
    }

    // Return user info for request context
    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantOrganizationId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.isEmailVerified,
      isActive: user.isActive,
      jti: payload.jti,
    };
  }

  private requiresEmailVerification(req: any): boolean {
    // Define routes that require email verification
    const protectedRoutes = [
      '/properties',
      '/bookings',
      '/payments',
      '/tenancies',
      '/maintenance-requests',
    ];

    return protectedRoutes.some(route => req.url.startsWith(route));
  }
}
