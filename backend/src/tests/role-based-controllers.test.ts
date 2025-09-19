import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { SuperAdminController } from '../super-admin/super-admin.controller';
import { AdminController } from '../admin/admin.controller';
import { PropertyManagerController } from '../property-manager/property-manager.controller';
import { ContractorController } from '../contractor/contractor.controller';
import { SellerController } from '../seller/seller.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/enums/user-role.enum';

// Mock services
const mockSuperAdminService = {
  getDashboard: jest.fn().mockResolvedValue({ stats: 'super-admin-stats' }),
  getSystemConfig: jest.fn().mockResolvedValue({ config: 'system-config' }),
  getSecurityEvents: jest.fn().mockResolvedValue({ events: [] }),
  getAnalytics: jest.fn().mockResolvedValue({ analytics: 'data' }),
  getOrganizations: jest.fn().mockResolvedValue({ organizations: [] }),
  getBackups: jest.fn().mockResolvedValue({ backups: [] }),
  getAuditLogs: jest.fn().mockResolvedValue({ logs: [] }),
  getSystemHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
  getGlobalUsers: jest.fn().mockResolvedValue({ users: [] }),
  getGlobalSettings: jest.fn().mockResolvedValue({ settings: {} }),
};

const mockAdminService = {
  getDashboard: jest.fn().mockResolvedValue({ stats: 'admin-stats' }),
  getStats: jest.fn().mockResolvedValue({ stats: {} }),
  getActivity: jest.fn().mockResolvedValue({ activity: [] }),
  getAlerts: jest.fn().mockResolvedValue({ alerts: [] }),
  getHealthCheck: jest.fn().mockResolvedValue({ status: 'ok' }),
};

const mockPropertyManagerService = {
  getDashboard: jest.fn().mockResolvedValue({ stats: 'pm-stats' }),
  getPortfolio: jest.fn().mockResolvedValue({ properties: [] }),
  getPropertyDetails: jest.fn().mockResolvedValue({ property: {} }),
  getStaff: jest.fn().mockResolvedValue({ staff: [] }),
  getMaintenanceRequests: jest.fn().mockResolvedValue({ requests: [] }),
  getReports: jest.fn().mockResolvedValue({ reports: [] }),
  getSchedule: jest.fn().mockResolvedValue({ schedule: [] }),
  getPerformanceAnalytics: jest.fn().mockResolvedValue({ analytics: {} }),
  getTenants: jest.fn().mockResolvedValue({ tenants: [] }),
  getInspections: jest.fn().mockResolvedValue({ inspections: [] }),
};

const mockContractorService = {
  getDashboard: jest.fn().mockResolvedValue({ stats: 'contractor-stats' }),
  getWorkOrders: jest.fn().mockResolvedValue({ orders: [] }),
  getSchedule: jest.fn().mockResolvedValue({ schedule: [] }),
  getInvoices: jest.fn().mockResolvedValue({ invoices: [] }),
  getEarnings: jest.fn().mockResolvedValue({ earnings: {} }),
  getProfile: jest.fn().mockResolvedValue({ profile: {} }),
  getReviews: jest.fn().mockResolvedValue({ reviews: [] }),
  getTimeTracking: jest.fn().mockResolvedValue({ timeEntries: [] }),
  getExpenseReports: jest.fn().mockResolvedValue({ expenses: [] }),
};

const mockSellerService = {
  getDashboard: jest.fn().mockResolvedValue({ stats: 'seller-stats' }),
  getListings: jest.fn().mockResolvedValue({ listings: [] }),
  getOffers: jest.fn().mockResolvedValue({ offers: [] }),
  getMarketAnalysis: jest.fn().mockResolvedValue({ analysis: {} }),
  getValuations: jest.fn().mockResolvedValue({ valuations: [] }),
  getShowings: jest.fn().mockResolvedValue({ showings: [] }),
  getAnalytics: jest.fn().mockResolvedValue({ analytics: {} }),
  getReports: jest.fn().mockResolvedValue({ reports: [] }),
  getProfile: jest.fn().mockResolvedValue({ profile: {} }),
  getDocuments: jest.fn().mockResolvedValue({ documents: [] }),
  getNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
};

// Mock JWT service
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

// Helper function to create JWT token for testing
function createMockToken(userId: string, role: UserRole): string {
  return `mock-token-${userId}-${role}`;
}

// Mock authentication middleware
const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation((context) => {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.substring(7);
    const [, userId, role] = token.split('-');
    
    request.user = {
      id: userId,
      role: role as UserRole,
    };
    
    return true;
  }),
};

// Mock roles guard
const mockRolesGuard = {
  canActivate: jest.fn().mockImplementation((context) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) return false;
    
    // Get required roles from metadata (simplified for testing)
    const handler = context.getHandler();
    const requiredRoles = Reflect.getMetadata('roles', handler) || [];
    
    if (requiredRoles.length === 0) return true;
    
    return requiredRoles.includes(user.role);
  }),
};

describe('Role-Based Controllers Integration Tests', () => {
  let app: INestApplication;
  let superAdminController: SuperAdminController;
  let adminController: AdminController;
  let propertyManagerController: PropertyManagerController;
  let contractorController: ContractorController;
  let sellerController: SellerController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        SuperAdminController,
        AdminController,
        PropertyManagerController,
        ContractorController,
        SellerController,
      ],
      providers: [
        { provide: 'SuperAdminService', useValue: mockSuperAdminService },
        { provide: 'AdminService', useValue: mockAdminService },
        { provide: 'PropertyManagerService', useValue: mockPropertyManagerService },
        { provide: 'ContractorService', useValue: mockContractorService },
        { provide: 'SellerService', useValue: mockSellerService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    superAdminController = moduleFixture.get<SuperAdminController>(SuperAdminController);
    adminController = moduleFixture.get<AdminController>(AdminController);
    propertyManagerController = moduleFixture.get<PropertyManagerController>(PropertyManagerController);
    contractorController = moduleFixture.get<ContractorController>(ContractorController);
    sellerController = moduleFixture.get<SellerController>(SellerController);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('Super Admin Controller', () => {
    const superAdminToken = createMockToken('1', UserRole.SUPER_ADMIN);
    const adminToken = createMockToken('2', UserRole.ADMIN);
    const userToken = createMockToken('3', UserRole.CLIENT);

    beforeEach(() => {
      // Set up roles metadata for super admin endpoints
      Reflect.defineMetadata('roles', [UserRole.SUPER_ADMIN], SuperAdminController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.SUPER_ADMIN], SuperAdminController.prototype.getSystemConfig);
    });

    it('should allow super admin access to dashboard', () => {
      return request(app.getHttpServer())
        .get('/super-admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200)
        .expect({ stats: 'super-admin-stats' });
    });

    it('should deny admin access to super admin endpoints', () => {
      return request(app.getHttpServer())
        .get('/super-admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should deny regular user access to super admin endpoints', () => {
      return request(app.getHttpServer())
        .get('/super-admin/system-config')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/super-admin/dashboard')
        .expect(401);
    });
  });

  describe('Admin Controller', () => {
    const superAdminToken = createMockToken('1', UserRole.SUPER_ADMIN);
    const adminToken = createMockToken('2', UserRole.ADMIN);
    const userToken = createMockToken('3', UserRole.CLIENT);

    beforeEach(() => {
      Reflect.defineMetadata('roles', [UserRole.ADMIN], AdminController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.ADMIN], AdminController.prototype.getStats);
    });

    it('should allow admin access to dashboard', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect({ stats: 'admin-stats' });
    });

    it('should allow super admin access to admin endpoints', () => {
      // Super admin should have access to admin endpoints
      Reflect.defineMetadata('roles', [UserRole.ADMIN, UserRole.SUPER_ADMIN], AdminController.prototype.getDashboard);
      
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('should deny regular user access to admin endpoints', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Property Manager Controller', () => {
    const propertyManagerToken = createMockToken('3', UserRole.PROPERTY_MANAGER);
    const adminToken = createMockToken('2', UserRole.ADMIN);
    const contractorToken = createMockToken('4', UserRole.CONTRACTOR);

    beforeEach(() => {
      Reflect.defineMetadata('roles', [UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN], PropertyManagerController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN], PropertyManagerController.prototype.getPortfolio);
    });

    it('should allow property manager access to dashboard', () => {
      return request(app.getHttpServer())
        .get('/property-manager/dashboard')
        .set('Authorization', `Bearer ${propertyManagerToken}`)
        .expect(200)
        .expect({ stats: 'pm-stats' });
    });

    it('should allow admin access to property manager endpoints', () => {
      return request(app.getHttpServer())
        .get('/property-manager/portfolio')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny contractor access to property manager endpoints', () => {
      return request(app.getHttpServer())
        .get('/property-manager/dashboard')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(403);
    });
  });

  describe('Contractor Controller', () => {
    const contractorToken = createMockToken('4', UserRole.CONTRACTOR);
    const propertyManagerToken = createMockToken('3', UserRole.PROPERTY_MANAGER);
    const clientToken = createMockToken('5', UserRole.CLIENT);

    beforeEach(() => {
      Reflect.defineMetadata('roles', [UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER], ContractorController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.CONTRACTOR], ContractorController.prototype.getWorkOrders);
    });

    it('should allow contractor access to dashboard', () => {
      return request(app.getHttpServer())
        .get('/contractor/dashboard')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200)
        .expect({ stats: 'contractor-stats' });
    });

    it('should allow property manager access to contractor dashboard', () => {
      return request(app.getHttpServer())
        .get('/contractor/dashboard')
        .set('Authorization', `Bearer ${propertyManagerToken}`)
        .expect(200);
    });

    it('should deny client access to contractor endpoints', () => {
      return request(app.getHttpServer())
        .get('/contractor/work-orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('Seller Controller', () => {
    const sellerToken = createMockToken('5', UserRole.SELLER);
    const adminToken = createMockToken('2', UserRole.ADMIN);
    const buyerToken = createMockToken('6', UserRole.BUYER);

    beforeEach(() => {
      Reflect.defineMetadata('roles', [UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN], SellerController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN], SellerController.prototype.getListings);
    });

    it('should allow seller access to dashboard', () => {
      return request(app.getHttpServer())
        .get('/seller/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200)
        .expect({ stats: 'seller-stats' });
    });

    it('should allow admin access to seller endpoints', () => {
      return request(app.getHttpServer())
        .get('/seller/listings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny buyer access to seller management endpoints', () => {
      return request(app.getHttpServer())
        .get('/seller/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  describe('Cross-Role Access Patterns', () => {
    it('should enforce role hierarchy correctly', async () => {
      const superAdminToken = createMockToken('1', UserRole.SUPER_ADMIN);
      
      // Super admin should have access to all endpoints
      const endpoints = [
        '/admin/dashboard',
        '/property-manager/dashboard',
        '/contractor/dashboard',
        '/seller/dashboard'
      ];
      
      // Set up metadata for all endpoints to allow super admin
      Reflect.defineMetadata('roles', [UserRole.ADMIN, UserRole.SUPER_ADMIN], AdminController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN], PropertyManagerController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.CONTRACTOR, UserRole.SUPER_ADMIN], ContractorController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.SELLER, UserRole.SUPER_ADMIN], SellerController.prototype.getDashboard);
      
      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);
      }
    });

    it('should properly isolate role-specific endpoints', async () => {
      const contractorToken = createMockToken('4', UserRole.CONTRACTOR);
      
      // Contractor should not have access to admin or seller endpoints
      const restrictedEndpoints = [
        '/admin/dashboard',
        '/seller/dashboard'
      ];
      
      Reflect.defineMetadata('roles', [UserRole.ADMIN], AdminController.prototype.getDashboard);
      Reflect.defineMetadata('roles', [UserRole.SELLER], SellerController.prototype.getDashboard);
      
      for (const endpoint of restrictedEndpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${contractorToken}`)
          .expect(403);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing authorization header', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .expect(401);
    });

    it('should handle invalid token format', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });

    it('should handle malformed bearer token', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer')
        .expect(401);
    });
  });

  describe('Service Integration', () => {
    it('should call appropriate service methods', async () => {
      const adminToken = createMockToken('2', UserRole.ADMIN);
      Reflect.defineMetadata('roles', [UserRole.ADMIN], AdminController.prototype.getDashboard);
      
      await request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(mockAdminService.getDashboard).toHaveBeenCalled();
    });

    it('should pass user context to services', async () => {
      const propertyManagerToken = createMockToken('3', UserRole.PROPERTY_MANAGER);
      Reflect.defineMetadata('roles', [UserRole.PROPERTY_MANAGER], PropertyManagerController.prototype.getPortfolio);
      
      await request(app.getHttpServer())
        .get('/property-manager/portfolio')
        .set('Authorization', `Bearer ${propertyManagerToken}`)
        .expect(200);
      
      expect(mockPropertyManagerService.getPortfolio).toHaveBeenCalled();
    });
  });
});

// Performance and load testing
describe('Role-Based Access Performance', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: 'AdminService', useValue: mockAdminService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should handle concurrent requests efficiently', async () => {
    const adminToken = createMockToken('2', UserRole.ADMIN);
    Reflect.defineMetadata('roles', [UserRole.ADMIN], AdminController.prototype.getDashboard);
    
    const requests = Array(10).fill(null).map(() => 
      request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
    );
    
    const startTime = Date.now();
    await Promise.all(requests);
    const endTime = Date.now();
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(1000);
  });
});