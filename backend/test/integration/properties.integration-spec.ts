import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertiesModule } from '../../src/properties/properties.module';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { Property, PropertyType, PropertyStatus, ListingType } from '../../src/properties/entities/property.entity';
import { CreatePropertyDto } from '../../src/properties/dto/create-property.dto';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Properties Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let propertyRepository: Repository<Property>;
  let landlordToken: string;
  let tenantToken: string;
  let adminToken: string;
  let testLandlord: any;
  let testTenant: any;
  let testAdmin: any;
  let testProperty: any;

  const landlordData = {
    email: 'landlord@example.com',
    password: 'LandlordPass123!',
    firstName: 'John',
    lastName: 'Landlord',
    role: UserRole.LANDLORD
  };

  const tenantData = {
    email: 'tenant@example.com',
    password: 'TenantPassword123!',
    firstName: 'Jane',
    lastName: 'Tenant',
    role: UserRole.TENANT
  };

  const adminData = {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN
  };

  const propertyData = {
    title: 'Test Property',
    description: 'A beautiful test property',
    listingType: ListingType.RENT,
    price: 1200,
    propertyType: PropertyType.HOUSE,
    bedrooms: 3,
    bathrooms: 2,
    propertyStatus: PropertyStatus.AVAILABLE,
    location: {
      address: '123 Test Street',
      city: 'London',
      county: 'Greater London',
      postcode: 'TE1 2ST',
      country: 'UK'
    },
    features: {
      furnished: true,
      petsAllowed: false,
      smokingAllowed: false,
      garden: true,
      parking: true
    },
    squareFeet: 1200,
    yearBuilt: 2020
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Property],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, Property]),
        PropertiesModule,
      ],
      providers: [
        JwtService,
        {
          provide: 'JWT_MODULE_OPTIONS',
          useValue: {
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    propertyRepository = moduleFixture.get<Repository<Property>>(getRepositoryToken(Property));

    await app.init();

    // Create test users and generate tokens
    const landlordUser = userRepository.create({
      ...landlordData,
      id: 'landlord-id',
      isActive: true,
      isVerified: true,
    });
    const tenantUser = userRepository.create({
      ...tenantData,
      id: 'tenant-id',
      isActive: true,
      isVerified: true,
    });
    const adminUser = userRepository.create({
      ...adminData,
      id: 'admin-id',
      isActive: true,
      isVerified: true,
    });
    
    await userRepository.save([landlordUser, tenantUser, adminUser]);
    
    testLandlord = { user: landlordUser };
    testTenant = { user: tenantUser };
    testAdmin = { user: adminUser };
    
    landlordToken = jwtService.sign({ sub: landlordUser.id, email: landlordUser.email, role: landlordUser.role });
    tenantToken = jwtService.sign({ sub: tenantUser.id, email: tenantUser.email, role: tenantUser.role });
    adminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
  });

  afterAll(async () => {
    // Cleanup is handled by the test database reset
    await app.close();
  });

  describe('POST /properties', () => {
    it('should create property successfully with landlord role', async () => {
      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(propertyData.title);
      expect(response.body.description).toBe(propertyData.description);
      expect(response.body.location.address).toBe(propertyData.location.address);
      expect(response.body.location.postcode).toBe(propertyData.location.postcode);
      expect(response.body.propertyType).toBe(propertyData.propertyType);
      expect(response.body.bedrooms).toBe(propertyData.bedrooms);
      expect(response.body.bathrooms).toBe(propertyData.bathrooms);
      expect(response.body.price).toBe(propertyData.price);
      expect(response.body.features.furnished).toBe(propertyData.features.furnished);
      expect(response.body.features.petsAllowed).toBe(propertyData.features.petsAllowed);
      expect(response.body.features.smokingAllowed).toBe(propertyData.features.smokingAllowed);
      expect(response.body.propertyStatus).toBe(propertyData.propertyStatus);
      expect(response.body.landlordId).toBe(testLandlord.user.id);

      testProperty = response.body;
    });

    it('should create property successfully with admin role', async () => {
      const adminPropertyData = {
        ...propertyData,
        title: 'Admin Test Property',
        address: '456 Admin Street, Admin City, AC1 2AB',
        postcode: 'AC1 2AB'
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminPropertyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(adminPropertyData.title);
      expect(response.body.landlordId).toBe(testAdmin.user.id);

      // Clean up via HTTP
      await request(app.getHttpServer())
        .delete(`/api/properties/${response.body.id}`)
        .set('Authorization', `Bearer ${landlordToken}`);
    });

    it('should return 403 for tenant role', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(propertyData)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send(propertyData)
        .expect(401);
    });

    it('should return 400 for invalid property data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test description',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid property type', async () => {
      const invalidData = {
        ...propertyData,
        propertyType: 'INVALID_TYPE'
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for negative rent amount', async () => {
      const invalidData = {
        ...propertyData,
        rentAmount: -100
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid postcode format', async () => {
      const invalidData = {
        ...propertyData,
        postcode: 'INVALID'
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /properties', () => {
    beforeEach(async () => {
    // Ensure test property exists
    if (!testProperty) {
      // Create a test property via HTTP
      const createResponse = await request(app.getHttpServer())
        .post('/api/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(propertyData)
        .expect(201);
      
      testProperty = createResponse.body;
    }
  });

    it('should return all properties for authenticated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const property = response.body.find(p => p.id === testProperty.id);
      expect(property).toBeDefined();
      expect(property.title).toBe(propertyData.title);
    });

    it('should return properties for landlord', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const property = response.body.find(p => p.id === testProperty.id);
      expect(property).toBeDefined();
    });

    it('should return properties for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/properties')
        .expect(401);
    });

    it('should filter properties by property type', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ propertyType: PropertyType.HOUSE })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(property => {
        expect(property.propertyType).toBe(PropertyType.HOUSE);
      });
    });

    it('should filter properties by bedrooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ bedrooms: 3 })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(property => {
        expect(property.bedrooms).toBe(3);
      });
    });

    it('should filter properties by rent range', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ minRent: 1000, maxRent: 2000 })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(property => {
        expect(property.rentAmount).toBeGreaterThanOrEqual(1000);
        expect(property.rentAmount).toBeLessThanOrEqual(2000);
      });
    });

    it('should filter properties by availability status', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ status: PropertyStatus.AVAILABLE })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(property => {
        expect(property.status).toBe(PropertyStatus.AVAILABLE);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /properties/:id', () => {
    beforeEach(async () => {
      // Ensure test property exists
      if (!testProperty) {
        const createResponse = await request(app.getHttpServer())
          .post('/api/properties')
          .set('Authorization', `Bearer ${landlordToken}`)
          .send(propertyData);
        testProperty = createResponse.body;
      }
    });

    it('should return specific property for authenticated users', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      expect(response.body.id).toBe(testProperty.id);
      expect(response.body.title).toBe(propertyData.title);
      expect(response.body.description).toBe(propertyData.description);
    });

    it('should return 404 for non-existent property', async () => {
      const nonExistentId = '999999';
      
      await request(app.getHttpServer())
        .get(`/properties/${nonExistentId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .expect(401);
    });

    it('should return 400 for invalid property ID format', async () => {
      await request(app.getHttpServer())
        .get('/properties/invalid-id')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(400);
    });
  });

  describe('Role-based Property Access', () => {
    it('should allow landlords to see their own properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .query({ landlordId: testLandlord.user.id })
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(property => {
        expect(property.landlordId).toBe(testLandlord.user.id);
      });
    });

    it('should allow admins to see all properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow tenants to view properties but not create', async () => {
      // Can view
      await request(app.getHttpServer())
        .get('/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);

      // Cannot create
      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(propertyData)
        .expect(403);
    });
  });
});