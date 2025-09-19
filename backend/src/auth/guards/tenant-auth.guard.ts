import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TenantAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, run the JWT authentication
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if tenant isolation is required for this endpoint
    const requiresTenantIsolation = this.reflector.get<boolean>(
      'requiresTenantIsolation',
      context.getHandler(),
    ) ?? true; // Default to true for security

    if (!requiresTenantIsolation) {
      return true;
    }

    // Verify user has a tenant organization
    if (!user.tenantOrganizationId) {
      throw new ForbiddenException('User must belong to a tenant organization');
    }

    // Add tenant context to request for use in services
    request.tenantId = user.tenantOrganizationId;

    return true;
  }
}

// Decorator to skip tenant isolation for specific endpoints
export const SkipTenantIsolation = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('requiresTenantIsolation', false, descriptor.value);
    } else {
      Reflect.defineMetadata('requiresTenantIsolation', false, target);
    }
  };
};
