import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../../src/users/users.module';
import { PropertiesModule } from '../../src/properties/properties.module';
import { BookingsModule } from '../../src/bookings/bookings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersService } from '../../src/users/users.service';
import { PropertiesService } from '../../src/properties/properties.service';
import { AuthService } from '../../src/auth/auth.service';
import { ValidationPipe } from '@nestjs/common';
import { Property, PropertyType, PropertyStatus, ListingType } from '../../src/properties/entities/property.entity';
import { BookingStatus } from '../../src/bookings/entities/booking.entity';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Bookings Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;
  let propertiesService: PropertiesService;

  let authService: AuthService;
  let landlordToken: string;
  let tenantToken: string;
  let adminToken: string;
  let anotherTenantToken: string;
  let testLandlord: any;
  let testTenant: any;
  let testAdmin: any;
  let anotherTenant: any;
  let testProperty: any;
  let testBooking: any;

  const landlordData = {
    email: 'landlord.booking@example.com',
    password: 'LandlordPass123!',
    firstName: 'John',
    lastName: 'Landlord',
    role: UserRole.LANDLORD
  };

  const tenantData = {
    email: 'tenant.booking@example.com',
    password: 'TenantPass123!',
    firstName: 'Jane',
    lastName: 'Tenant',
    role: UserRole.TENANT
  };

  const adminData = {
    email: 'admin.booking@example.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN
  };

  const anotherTenantData = {
    email: 'tenant2.booking@example.com',
    password: 'Tenant2Pass123!',
    firstName: 'Bob',
    lastName: 'Tenant2',
    role: UserRole.TENANT
  };

  const propertyData = {
    title: 'Booking Test Property',
    description: 'A property for booking tests',
    listingType: ListingType.RENT,
    price: 1200,
    propertyType: PropertyType.APARTMENT,
    bedrooms: 2,
    bathrooms: 1,
    propertyStatus: PropertyStatus.AVAILABLE,
    location: {
      address: '789 Booking Street',
      city: 'Booking City',
      county: 'Greater London',
      postcode: 'BC1 2AB',
      country: 'UK'
    },
    features: {
      furnished: true,
      petsAllowed: true,
      smokingAllowed: false,
      garden: false,
      parking: true
    },
    squareFeet: 800,
    yearBuilt: 2015
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        UsersModule,
        PropertiesModule,
        BookingsModule,
        AuthModule
      ],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload) => `mock-token-${payload.sub}`),
            verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@example.com' })
          }
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    jwtService = moduleFixture.get<JwtService>(JwtService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    propertiesService = moduleFixture.get<PropertiesService>(PropertiesService);

    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();

    // Get repositories
    const userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    const propertyRepository = moduleFixture.get<Repository<Property>>(getRepositoryToken(Property));

    // Create test users directly
    const landlord = userRepository.create({ ...landlordData, id: '1', isVerified: true });
    const tenant = userRepository.create({ ...tenantData, id: '2', isVerified: true });
    const admin = userRepository.create({ ...adminData, id: '3', isVerified: true });
    const anotherTenantUser = userRepository.create({ ...anotherTenantData, id: '4', isVerified: true });

    testLandlord = { user: await userRepository.save(landlord) };
    testTenant = { user: await userRepository.save(tenant) };
    testAdmin = { user: await userRepository.save(admin) };
    anotherTenant = { user: await userRepository.save(anotherTenantUser) };

    // Generate tokens
    landlordToken = jwtService.sign({ sub: testLandlord.user.id, email: testLandlord.user.email, role: testLandlord.user.role });
    tenantToken = jwtService.sign({ sub: testTenant.user.id, email: testTenant.user.email, role: testTenant.user.role });
    adminToken = jwtService.sign({ sub: testAdmin.user.id, email: testAdmin.user.email, role: testAdmin.user.role });
    anotherTenantToken = jwtService.sign({ sub: anotherTenant.user.id, email: anotherTenant.user.email, role: anotherTenant.user.role });

    // Create test property
    testProperty = await propertiesService.create(propertyData, testLandlord.user.id);
  });

  afterAll(async () => {
    // Clean up test data
    try {
      if (testBooking?.id) {
        await request(app.getHttpServer())
          .delete(`/api/bookings/${testBooking.id}`)
          .set('Authorization', `Bearer ${tenantToken}`);
      }
      if (testProperty?.id) {
        await propertiesService.remove(testProperty.id);
      }
      if (testLandlord?.user?.id) {
        await usersService.remove(testLandlord.user.id);
      }
      if (testTenant?.user?.id) {
        await usersService.remove(testTenant.user.id);
      }
      if (testAdmin?.user?.id) {
        await usersService.remove(testAdmin.user.id);
      }
      if (anotherTenant?.user?.id) {
        await usersService.remove(anotherTenant.user.id);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
    await app.close();
  });

  describe('POST /bookings', () => {
    const bookingData = {
      propertyId: '', // Will be set in beforeEach
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      totalAmount: 1200,
      message: 'I would like to book this property'
    };

    beforeEach(() => {
      bookingData.propertyId = testProperty.id;
    });

    it('should create booking successfully with tenant role', async () => {
      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(bookingData.propertyId);
      expect(response.body.tenantId).toBe(testTenant.user.id);
      expect(new Date(response.body.startDate)).toEqual(bookingData.startDate);
      expect(new Date(response.body.endDate)).toEqual(bookingData.endDate);
      expect(response.body.totalAmount).toBe(bookingData.totalAmount);
      expect(response.body.message).toBe(bookingData.message);
      expect(response.body.status).toBe(BookingStatus.PENDING);

      testBooking = response.body;
    });

    it('should create booking successfully with admin role', async () => {
      const adminBookingData = {
        ...bookingData,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-30'),
        message: 'Admin booking test'
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminBookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tenantId).toBe(testAdmin.user.id);
      expect(response.body.status).toBe(BookingStatus.PENDING);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/api/bookings/${response.body.id}`)
        .set('Authorization', `Bearer ${tenantToken}`);
    });

    it('should return 403 for landlord role trying to book', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(bookingData)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(401);
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidData = {
        propertyId: testProperty.id,
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid property ID', async () => {
      const invalidData = {
        ...bookingData,
        propertyId: 'invalid-property-id'
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 404 for non-existent property', async () => {
      const invalidData = {
        ...bookingData,
        propertyId: '999999'
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(404);
    });

    it('should return 400 for invalid date range (end before start)', async () => {
      const invalidData = {
        ...bookingData,
        startDate: new Date('2024-03-31'),
        endDate: new Date('2024-03-01')
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for past start date', async () => {
      const invalidData = {
        ...bookingData,
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-01-31')
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for negative total amount', async () => {
      const invalidData = {
        ...bookingData,
        totalAmount: -100
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should prevent double booking for same dates', async () => {
      // First booking should succeed
      const firstBookingData = {
        ...bookingData,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-31')
      };

      const firstResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(firstBookingData)
        .expect(201);

      // Second booking with overlapping dates should fail
      const overlappingBookingData = {
        ...bookingData,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-06-15')
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${anotherTenantToken}`)
        .send(overlappingBookingData)
        .expect(409);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/api/bookings/${firstResponse.body.id}`)
        .set('Authorization', `Bearer ${tenantToken}`);
    });
  });

  describe('GET /bookings', () => {
    beforeEach(async () => {
      // Ensure test booking exists
      if (!testBooking) {
        const bookingData = {
          propertyId: testProperty.id,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-31'),
          totalAmount: 1200,
          message: 'Test booking'
        };
        const createResponse = await request(app.getHttpServer())
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantToken}`)
          .send(bookingData);
        testBooking = createResponse.body;
      }
    });

    it('should return tenant\'s own bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const booking = response.body.find(b => b.id === testBooking.id);
      expect(booking).toBeDefined();
      expect(booking.tenantId).toBe(testTenant.user.id);
    });

    it('should return landlord\'s property bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include bookings for landlord's properties
      const booking = response.body.find(b => b.propertyId === testProperty.id);
      expect(booking).toBeDefined();
    });

    it('should return all bookings for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/bookings')
        .expect(401);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .query({ status: BookingStatus.PENDING })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(booking => {
        expect(booking.status).toBe(BookingStatus.PENDING);
      });
    });

    it('should filter bookings by property', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .query({ propertyId: testProperty.id })
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(booking => {
        expect(booking.propertyId).toBe(testProperty.id);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /bookings/:id', () => {
    beforeEach(async () => {
      // Ensure test booking exists
      if (!testBooking) {
        const bookingData = {
          propertyId: testProperty.id,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-31'),
          totalAmount: 1200,
          message: 'Test booking'
        };
        const createResponse = await request(app.getHttpServer())
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tenantToken}`)
          .send(bookingData);
        testBooking = createResponse.body;
      }
    });

    it('should return specific booking for tenant owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(response.body.id).toBe(testBooking.id);
      expect(response.body.tenantId).toBe(testTenant.user.id);
    });

    it('should return specific booking for property landlord', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.id).toBe(testBooking.id);
      expect(response.body.propertyId).toBe(testProperty.id);
    });

    it('should return specific booking for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testBooking.id);
    });

    it('should return 403 for unauthorized tenant', async () => {
      await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${anotherTenantToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent booking', async () => {
      const nonExistentId = '999999';
      
      await request(app.getHttpServer())
        .get(`/bookings/${nonExistentId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .expect(401);
    });

    it('should return 400 for invalid booking ID format', async () => {
      await request(app.getHttpServer())
        .get('/bookings/invalid-id')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(400);
    });
  });

  describe('Role-based Booking Access', () => {
    it('should allow tenants to create and view their bookings', async () => {
      // Can create
      const bookingData = {
        propertyId: testProperty.id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        totalAmount: 1200,
        message: 'Role test booking'
      };

      const createResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(bookingData)
        .expect(201);

      // Can view own bookings
      await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/api/bookings/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${tenantToken}`);
    });

    it('should allow landlords to view bookings for their properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .query({ propertyId: testProperty.id })
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should prevent landlords from creating bookings', async () => {
      const bookingData = {
        propertyId: testProperty.id,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-31'),
        totalAmount: 1200,
        message: 'Landlord booking attempt'
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(bookingData)
        .expect(403);
    });

    it('should allow admins full access to all bookings', async () => {
      // Can view all
      await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Can create
      const bookingData = {
        propertyId: testProperty.id,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-31'),
        totalAmount: 1200,
        message: 'Admin booking'
      };

      const createResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookingData)
        .expect(201);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/api/bookings/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${tenantToken}`);
    });
  });
});