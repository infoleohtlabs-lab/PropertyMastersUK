# PropertyMasters UK - Testing Implementation Specification

**Version:** 1.0  
**Date:** January 2025  
**Project:** Multi-Tenant SaaS Property Platform - Testing Strategy  
**Document Type:** Comprehensive Testing Implementation Guide

***

## 1. Overview

This document outlines the comprehensive testing strategy for PropertyMasters UK, covering unit testing, integration testing, end-to-end testing, performance testing, and security testing to ensure robust, reliable, and scalable application delivery.

### 1.1 Testing Objectives

- **Quality Assurance**: Ensure code quality and functionality
- **Regression Prevention**: Prevent introduction of bugs in new releases
- **Performance Validation**: Verify system performance under load
- **Security Compliance**: Validate security measures and data protection
- **User Experience**: Ensure optimal user experience across all platforms
- **Code Coverage**: Achieve minimum 80% code coverage

### 1.2 Testing Pyramid Strategy

```mermaid
graph TD
    A["E2E Tests (10%)"] --> B["Integration Tests (20%)"] 
    B --> C["Unit Tests (70%)"]
    
    subgraph "Testing Pyramid"
        A
        B
        C
    end
    
    D["Manual Testing"] --> A
    E["Performance Testing"] --> B
    F["Security Testing"] --> B
end
```

## 2. Unit Testing Implementation

### 2.1 Backend Unit Testing (NestJS + Jest)

**Configuration Setup:**

```typescript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.module.ts',
    '!main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

**Service Unit Test Example:**

```typescript
// src/properties/properties.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyType } from './enums/property-type.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: Repository<Property>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get<Repository<Property>>(getRepositoryToken(Property));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockProperties = [
        {
          id: '1',
          title: 'Test Property 1',
          price: 500000,
          propertyType: PropertyType.HOUSE,
        },
        {
          id: '2',
          title: 'Test Property 2',
          price: 750000,
          propertyType: PropertyType.FLAT,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProperties, 2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        properties: mockProperties,
        total: 2,
        page: 1,
        totalPages: 1,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('property');
    });

    it('should apply search filter', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ page: 1, limit: 10, search: 'London' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(property.title ILIKE :search OR property.description ILIKE :search)',
        { search: '%London%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const mockProperty = {
        id: '1',
        title: 'Test Property',
        price: 500000,
      };

      mockRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProperty);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['owner', 'images', 'bookings'],
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createPropertyDto: CreatePropertyDto = {
        title: 'New Property',
        description: 'A beautiful new property',
        propertyType: PropertyType.HOUSE,
        price: 600000,
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '123 Test Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      };

      const mockProperty = {
        id: '1',
        ...createPropertyDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockProperty);
      mockRepository.save.mockResolvedValue(mockProperty);

      const result = await service.create(createPropertyDto, 'user-id');

      expect(result).toEqual(mockProperty);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createPropertyDto,
        ownerId: 'user-id',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProperty);
    });

    it('should validate property data', async () => {
      const invalidDto = {
        title: '', // Invalid: empty title
        price: -1000, // Invalid: negative price
      } as CreatePropertyDto;

      await expect(service.create(invalidDto, 'user-id')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
```

**Controller Unit Test Example:**

```typescript
// src/properties/properties.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyType } from './enums/property-type.enum';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: PropertiesService;

  const mockPropertiesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get<PropertiesService>(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockResult = {
        properties: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      mockPropertiesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createPropertyDto: CreatePropertyDto = {
        title: 'Test Property',
        description: 'A test property',
        propertyType: PropertyType.HOUSE,
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '123 Test Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      };

      const mockProperty = {
        id: '1',
        ...createPropertyDto,
        createdAt: new Date(),
      };

      mockPropertiesService.create.mockResolvedValue(mockProperty);

      const result = await controller.create(createPropertyDto);

      expect(result).toEqual(mockProperty);
      expect(service.create).toHaveBeenCalledWith(createPropertyDto);
    });
  });
});
```

### 2.2 Frontend Unit Testing (React + Jest + Testing Library)

**Configuration Setup:**

```typescript
// jest.config.js (Frontend)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Component Unit Test Example:**

```typescript
// src/components/PropertyCard/PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';
import { Property } from '@/types/property';

const mockProperty: Property = {
  id: '1',
  title: 'Beautiful 3-bedroom house',
  description: 'A stunning property in central London',
  propertyType: 'house',
  price: 750000,
  bedrooms: 3,
  bathrooms: 2,
  address: {
    street: '123 Main Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
  },
  images: ['image1.jpg', 'image2.jpg'],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('PropertyCard', () => {
  const mockOnClick = jest.fn();
  const mockOnBooking = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders property information correctly', () => {
    render(
      <PropertyCard
        property={mockProperty}
        onClick={mockOnClick}
        onBooking={mockOnBooking}
      />
    );

    expect(screen.getByText('Beautiful 3-bedroom house')).toBeInTheDocument();
    expect(screen.getByText('£750,000')).toBeInTheDocument();
    expect(screen.getByText('3 bed')).toBeInTheDocument();
    expect(screen.getByText('2 bath')).toBeInTheDocument();
    expect(screen.getByText('London, SW1A 1AA')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(
      <PropertyCard
        property={mockProperty}
        onClick={mockOnClick}
        onBooking={mockOnBooking}
      />
    );

    fireEvent.click(screen.getByTestId('property-card'));
    expect(mockOnClick).toHaveBeenCalledWith(mockProperty.id);
  });

  it('calls onBooking when book viewing button is clicked', () => {
    render(
      <PropertyCard
        property={mockProperty}
        onClick={mockOnClick}
        onBooking={mockOnBooking}
      />
    );

    fireEvent.click(screen.getByText('Book Viewing'));
    expect(mockOnBooking).toHaveBeenCalledWith(mockProperty.id);
  });

  it('displays property image with correct alt text', () => {
    render(
      <PropertyCard
        property={mockProperty}
        onClick={mockOnClick}
        onBooking={mockOnBooking}
      />
    );

    const image = screen.getByAltText('Beautiful 3-bedroom house');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });

  it('formats price correctly', () => {
    const expensiveProperty = {
      ...mockProperty,
      price: 1250000,
    };

    render(
      <PropertyCard
        property={expensiveProperty}
        onClick={mockOnClick}
        onBooking={mockOnBooking}
      />
    );

    expect(screen.getByText('£1,250,000')).toBeInTheDocument();
  });
});
```

## 3. Integration Testing

### 3.1 API Integration Tests

```typescript
// test/integration/properties.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { CreatePropertyDto } from '../../src/properties/dto/create-property.dto';
import { PropertyType } from '../../src/properties/enums/property-type.enum';

describe('Properties Integration Tests', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    
    await app.init();
    
    // Setup test database
    await databaseService.clearDatabase();
    await databaseService.seedTestData();
    
    // Create test user and get auth token
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'agent',
      });
      
    userId = userResponse.body.user.id;
    authToken = userResponse.body.accessToken;
  });

  afterAll(async () => {
    await databaseService.clearDatabase();
    await app.close();
  });

  describe('Property CRUD Operations', () => {
    let propertyId: string;

    it('should create a new property', async () => {
      const propertyData: CreatePropertyDto = {
        title: 'Integration Test Property',
        description: 'A property created during integration testing',
        propertyType: PropertyType.HOUSE,
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '123 Integration Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
        features: ['parking', 'garden'],
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(propertyData.title);
      expect(response.body.ownerId).toBe(userId);
      
      propertyId = response.body.id;
    });

    it('should retrieve the created property', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${propertyId}`)
        .expect(200);

      expect(response.body.id).toBe(propertyId);
      expect(response.body.title).toBe('Integration Test Property');
    });

    it('should update the property', async () => {
      const updateData = {
        title: 'Updated Integration Test Property',
        price: 550000,
      };

      const response = await request(app.getHttpServer())
        .put(`/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should delete the property', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify property is deleted
      await request(app.getHttpServer())
        .get(`/properties/${propertyId}`)
        .expect(404);
    });
  });

  describe('Property Search and Filtering', () => {
    beforeAll(async () => {
      // Create test properties
      const properties = [
        {
          title: 'London House',
          propertyType: PropertyType.HOUSE,
          price: 800000,
          bedrooms: 4,
          address: { city: 'London', postcode: 'SW1A 1AA' },
        },
        {
          title: 'Manchester Flat',
          propertyType: PropertyType.FLAT,
          price: 300000,
          bedrooms: 2,
          address: { city: 'Manchester', postcode: 'M1 1AA' },
        },
      ];

      for (const property of properties) {
        await request(app.getHttpServer())
          .post('/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send(property);
      }
    });

    it('should filter properties by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties?propertyType=house')
        .expect(200);

      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].propertyType).toBe('house');
    });

    it('should filter properties by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties?minPrice=200000&maxPrice=400000')
        .expect(200);

      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].price).toBe(300000);
    });

    it('should search properties by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties?search=London')
        .expect(200);

      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].title).toContain('London');
    });
  });
});
```

### 3.2 Database Integration Tests

```typescript
// test/integration/database.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../src/properties/entities/property.entity';
import { User } from '../../src/users/entities/user.entity';
import { DatabaseModule } from '../../src/database/database.module';

describe('Database Integration Tests', () => {
  let module: TestingModule;
  let propertyRepository: Repository<Property>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([Property, User]),
      ],
    }).compile();

    propertyRepository = module.get('PropertyRepository');
    userRepository = module.get('UserRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Property-User Relationships', () => {
    it('should create property with owner relationship', async () => {
      // Create user
      const user = userRepository.create({
        email: 'owner@example.com',
        firstName: 'Property',
        lastName: 'Owner',
        role: 'landlord',
      });
      const savedUser = await userRepository.save(user);

      // Create property
      const property = propertyRepository.create({
        title: 'Test Property',
        description: 'Test Description',
        propertyType: 'house',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '123 Test Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
        owner: savedUser,
      });
      const savedProperty = await propertyRepository.save(property);

      // Verify relationship
      const foundProperty = await propertyRepository.findOne({
        where: { id: savedProperty.id },
        relations: ['owner'],
      });

      expect(foundProperty.owner.id).toBe(savedUser.id);
      expect(foundProperty.owner.email).toBe('owner@example.com');
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'unique@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
      };

      // Create first user
      const user1 = userRepository.create(userData);
      await userRepository.save(user1);

      // Try to create second user with same email
      const user2 = userRepository.create(userData);
      
      await expect(userRepository.save(user2)).rejects.toThrow();
    });
  });
});
```

## 4. End-to-End Testing

### 4.1 Playwright E2E Tests

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**E2E Test Example:**

```typescript
// e2e/property-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for properties', async ({ page }) => {
    // Enter search criteria
    await page.fill('[data-testid="search-input"]', 'London');
    await page.selectOption('[data-testid="property-type-select"]', 'house');
    await page.fill('[data-testid="min-price-input"]', '500000');
    await page.fill('[data-testid="max-price-input"]', '1000000');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="property-card"]');
    
    // Verify results
    const propertyCards = page.locator('[data-testid="property-card"]');
    await expect(propertyCards).toHaveCountGreaterThan(0);
    
    // Check first property contains search term
    const firstProperty = propertyCards.first();
    await expect(firstProperty).toContainText('London');
  });

  test('should filter search results', async ({ page }) => {
    // Perform initial search
    await page.fill('[data-testid="search-input"]', 'London');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="property-card"]');
    const initialCount = await page.locator('[data-testid="property-card"]').count();
    
    // Apply bedroom filter
    await page.selectOption('[data-testid="bedrooms-filter"]', '3');
    await page.waitForTimeout(1000); // Wait for filter to apply
    
    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="property-card"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Verify all results have 3 bedrooms
    const bedroomTexts = await page.locator('[data-testid="bedrooms-text"]').allTextContents();
    bedroomTexts.forEach(text => {
      expect(text).toContain('3 bed');
    });
  });

  test('should navigate to property detail page', async ({ page }) => {
    // Search for properties
    await page.fill('[data-testid="search-input"]', 'London');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results and click first property
    await page.waitForSelector('[data-testid="property-card"]');
    const firstProperty = page.locator('[data-testid="property-card"]').first();
    const propertyTitle = await firstProperty.locator('[data-testid="property-title"]').textContent();
    
    await firstProperty.click();
    
    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/properties\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText(propertyTitle);
  });
});
```

**User Authentication E2E Test:**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.selectOption('[data-testid="role-select"]', 'buyer');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Test');
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle login errors', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/auth/login');
  });
});
```

## 5. Performance Testing

### 5.1 Load Testing with Artillery

**Configuration:**

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  payload:
    path: "test-data.csv"
    fields:
      - "email"
      - "password"

scenarios:
  - name: "Property Search"
    weight: 70
    flow:
      - get:
          url: "/"
      - get:
          url: "/api/properties"
          qs:
            page: 1
            limit: 20
            search: "London"
      - think: 2
      - get:
          url: "/api/properties/{{ $randomUUID }}"
          
  - name: "User Authentication"
    weight: 20
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
      - think: 1
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ token }}"
            
  - name: "Property Creation"
    weight: 10
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "agent@example.com"
            password: "password123"
          capture:
            json: "$.accessToken"
            as: "token"
      - post:
          url: "/api/properties"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Load Test Property {{ $randomString() }}"
            description: "Property created during load testing"
            propertyType: "house"
            price: 500000
            bedrooms: 3
            bathrooms: 2
            address:
              street: "123 Test Street"
              city: "London"
              postcode: "SW1A 1AA"
              country: "United Kingdom"
```

### 5.2 Database Performance Testing

```typescript
// test/performance/database.performance.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '../../src/properties/properties.service';
import { DatabaseModule } from '../../src/database/database.module';
import { performance } from 'perf_hooks';

describe('Database Performance Tests', () => {
  let service: PropertiesService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [PropertiesService],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    
    // Seed test data
    await seedLargeDataset();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should handle large property searches efficiently', async () => {
    const startTime = performance.now();
    
    const result = await service.findAll({
      page: 1,
      limit: 100,
      search: 'London',
    });
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(500); // Should complete in under 500ms
    expect(result.properties).toHaveLength(100);
  });

  it('should handle concurrent property creation', async () => {
    const concurrentRequests = 50;
    const promises = [];
    
    const startTime = performance.now();
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        service.create({
          title: `Concurrent Property ${i}`,
          description: 'Created during performance test',
          propertyType: 'house',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2,
          address: {
            street: `${i} Test Street`,
            city: 'London',
            postcode: 'SW1A 1AA',
            country: 'United Kingdom',
          },
        }, 'test-user-id')
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(results).toHaveLength(concurrentRequests);
    expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
```

## 6. Security Testing

### 6.1 Authentication Security Tests

```typescript
// test/security/auth.security.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Authentication Security Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty',
        'abc123',
      ];

      for (const password of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `test${Date.now()}@example.com`,
            password,
            firstName: 'Test',
            lastName: 'User',
            role: 'buyer',
          })
          .expect(400);

        expect(response.body.error.message).toContain('password');
      }
    });

    it('should accept strong passwords', async () => {
      const strongPassword = 'StrongP@ssw0rd123!';
      
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `strong${Date.now()}@example.com`,
          password: strongPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'buyer',
        })
        .expect(201);
    });
  });

  describe('JWT Security', () => {
    it('should reject invalid JWT tokens', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'Bearer invalid',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
      ];

      for (const token of invalidTokens) {
        await request(app.getHttpServer())
          .get('/api/users/profile')
          .set('Authorization', token)
          .expect(401);
      }
    });

    it('should reject expired JWT tokens', async () => {
      // This would require a helper to generate expired tokens
      const expiredToken = generateExpiredToken();
      
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData);
      }

      // Next attempt should be rate limited
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(429);
    });
  });
});
```

### 6.2 Input Validation Security Tests

```typescript
// test/security/validation.security.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Input Validation Security Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
      
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in search queries', async () => {
      const maliciousInputs = [
        "'; DROP TABLE properties; --",
        "' OR '1'='1",
        "'; UPDATE users SET role='admin'; --",
        "' UNION SELECT * FROM users --",
      ];

      for (const input of maliciousInputs) {
        const response = await request(app.getHttpServer())
          .get('/api/properties')
          .query({ search: input })
          .expect(200);

        // Should return normal results, not execute malicious SQL
        expect(response.body).toHaveProperty('properties');
        expect(Array.isArray(response.body.properties)).toBe(true);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize HTML input in property creation', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("XSS")',
        '<svg onload="alert(1)">',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/properties')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: payload,
            description: `Property with XSS payload: ${payload}`,
            propertyType: 'house',
            price: 500000,
            bedrooms: 3,
            bathrooms: 2,
            address: {
              street: '123 Test Street',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'United Kingdom',
            },
          });

        if (response.status === 201) {
          // If creation succeeded, verify XSS payload was sanitized
          expect(response.body.title).not.toContain('<script>');
          expect(response.body.title).not.toContain('javascript:');
          expect(response.body.description).not.toContain('<script>');
        } else {
          // Should reject malicious input
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('File Upload Security', () => {
    it('should reject malicious file uploads', async () => {
      const maliciousFiles = [
        { filename: 'malware.exe', content: 'MZ\x90\x00\x03' },
        { filename: 'script.php', content: '<?php system($_GET["cmd"]); ?>' },
        { filename: 'large.jpg', content: 'A'.repeat(10 * 1024 * 1024) }, // 10MB
      ];

      for (const file of maliciousFiles) {
        await request(app.getHttpServer())
          .post('/api/properties/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from(file.content), file.filename)
          .expect(400);
      }
    });
  });
});
```

## 7. Test Automation & CI/CD

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
          
  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Artillery
        run: npm install -g artillery
        
      - name: Start application
        run: |
          npm run start:prod &
          sleep 30
          
      - name: Run performance tests
        run: artillery run artillery.yml
        
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: artillery-report.html
```

### 7.2 Test Scripts Configuration

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=spec.ts",
    "test:integration": "jest --testPathPattern=integration.spec.ts",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:performance": "artillery run artillery.yml",
    "test:security": "jest --testPathPattern=security.spec.ts",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## 8. Quality Gates & Metrics

### 8.1 Code Coverage Requirements

- **Minimum Coverage**: 80% for all metrics (lines, functions, branches, statements)
- **Critical Paths**: 95% coverage for authentication, payment, and security modules
- **New Code**: 90% coverage for all new features

### 8.2 Performance Benchmarks

- **API Response Time**: 95th percentile < 200ms
- **Database Queries**: < 100ms for simple queries, < 500ms for complex queries
- **Page Load Time**: < 3 seconds for initial load, < 1 second for subsequent navigation
- **Concurrent Users**: Support 1000+ concurrent users

### 8.3 Test Execution Metrics

- **Test Execution Time**: Full test suite < 15 minutes
- **Test Reliability**: < 1% flaky test rate
- **Test Maintenance**: Regular review and update of test cases

***

**Document Control**
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: February 2025
- **Approved By**: Development Team
- **Status**: Implementation Ready