import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Property, PropertyStatus, PropertyType } from '../src/properties/entities/property.entity';
// Note: Booking and Tenancy entities are excluded from integration tests due to SQLite enum compatibility issues
// import { Booking, BookingStatus, BookingType } from '../src/bookings/entities/booking.entity';
// import { Tenancy, TenancyStatus } from '../src/tenancy/entities/tenancy.entity';

/**
 * Integration test utilities for API testing
 */
export class IntegrationTestUtils {
  constructor(
    private app: INestApplication,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a test user and return JWT token
   */
  async createTestUserWithToken(userData: Partial<User> = {}): Promise<{ user: User; token: string }> {
    const userRepository = this.dataSource.getRepository(User);
    const jwtService = this.app.get(JwtService);

    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.TENANT,
      emailVerified: true,
      passwordHash: 'hashed-password',
      ...userData,
    };

    const user = userRepository.create(defaultUser);
    const savedUser = await userRepository.save(user);

    const token = jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return { user: savedUser, token };
  }

  /**
   * Create a test property
   */
  async createTestProperty(propertyData: Partial<Property> = {}, ownerId?: string): Promise<Property> {
    const propertyRepository = this.dataSource.getRepository(Property);

    const defaultProperty = {
      title: `Test Property ${Date.now()}`,
      description: 'A beautiful test property',
      type: PropertyType.HOUSE,
      price: 250000,
      bedrooms: 3,
      bathrooms: 2,
      addressLine1: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      amenities: ['garden', 'parking'],
      status: PropertyStatus.AVAILABLE,
      ...propertyData,
    };

    const property = propertyRepository.create(defaultProperty);
    return await propertyRepository.save(property);
  }

  /**
   * Create a test booking
   * Note: Disabled due to SQLite enum compatibility issues
   */
  // async createTestBooking(bookingData: Partial<Booking> = {}): Promise<Booking> {
  //   const bookingRepository = this.dataSource.getRepository(Booking);
  //
  //   const defaultBooking = {
  //     tenantOrganizationId: 'test-tenant-org-id',
  //     referenceNumber: `BK-${Date.now()}`,
  //     title: 'Test Booking',
  //     description: 'Test booking description',
  //     type: BookingType.VIEWING,
  //     status: BookingStatus.PENDING,
  //     propertyId: 'test-property-id',
  //     bookedById: 'test-user-id',
  //     startDateTime: new Date('2024-02-15T14:00:00Z'),
  //     endDateTime: new Date('2024-02-15T15:00:00Z'),
  //     durationMinutes: 60,
  //     ...bookingData,
  //   };
  //
  //   const booking = bookingRepository.create(defaultBooking);
  //   return await bookingRepository.save(booking);
  // }

  /**
   * Create a test tenancy
   * Note: Disabled due to SQLite enum compatibility issues
   */
  // async createTestTenancy(tenancyData: Partial<Tenancy> = {}): Promise<Tenancy> {
  //   const tenancyRepository = this.dataSource.getRepository(Tenancy);
  //
  //   const defaultTenancy = {
  //     propertyId: 'test-property-id',
  //     tenantId: 'test-tenant-id',
  //     landlordId: 'test-landlord-id',
  //     startDate: new Date('2024-01-01'),
  //     endDate: new Date('2024-12-31'),
  //     monthlyRent: 1200,
  //     deposit: 1200,
  //     status: TenancyStatus.ACTIVE,
  //     ...tenancyData,
  //   };
  //
  //   const tenancy = tenancyRepository.create(defaultTenancy);
  //   return await tenancyRepository.save(tenancy);
  // }

  /**
   * Make authenticated request
   */
  authenticatedRequest(token: string) {
    const httpServer = this.app.getHttpServer();
    const req = request(httpServer);
    // Return an object that proxies HTTP methods and adds authentication
    return new Proxy(req, {
       get(target, prop) {
         if (typeof target[prop] === 'function' && typeof prop === 'string' && ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(prop)) {
           return function(...args) {
             return target[prop](...args).set('Authorization', `Bearer ${token}`);
           };
         }
         return target[prop];
       }
     });
  }

  /**
   * Make a request without authentication
   */
  request() {
    const httpServer = this.app.getHttpServer();
    return request(httpServer);
  }

  /**
   * Clean up all test data
   */
  async cleanupDatabase(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  /**
   * Get repository for entity
   */
  getRepository<T>(entity: any): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  /**
   * Wait for a specified amount of time
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert response structure
   */
  expectValidResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
    return response.body;
  }

  /**
   * Assert error response structure
   */
  expectErrorResponse(response: any, expectedStatus: number, expectedMessage?: string) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('message');
    if (expectedMessage) {
      expect(response.body.message).toContain(expectedMessage);
    }
    return response.body;
  }

  /**
   * Assert pagination response structure
   */
  expectPaginatedResponse(response: any, expectedStatus: number = 200) {
    const body = this.expectValidResponse(response, expectedStatus);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('limit');
    expect(Array.isArray(body.data)).toBe(true);
    return body;
  }
}

/**
 * Create integration test utils instance
 */
export const createIntegrationTestUtils = (app: INestApplication, dataSource: DataSource) => {
  return new IntegrationTestUtils(app, dataSource);
};