import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';

/**
 * Mock repository factory for TypeORM entities
 */
export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
});

/**
 * Mock JWT service
 */
export const createMockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
});

/**
 * Mock config service
 */
export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      DATABASE_URL: 'test-db-url',
      SUPABASE_URL: 'test-supabase-url',
      SUPABASE_ANON_KEY: 'test-anon-key',
    };
    return config[key];
  }),
});

/**
 * Create test user data
 */
export const createTestUser = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'tenant',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test property data
 */
export const createTestProperty = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  ownerId: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Property',
  description: 'A beautiful test property',
  propertyType: 'house',
  price: 250000,
  bedrooms: 3,
  bathrooms: 2,
  address: {
    street: '123 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'UK',
  },
  features: ['garden', 'parking'],
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test booking data
 */
export const createTestBooking = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  propertyId: '123e4567-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  viewingDate: new Date('2024-02-15'),
  viewingTime: '14:00',
  contactName: 'Test User',
  contactEmail: 'test@example.com',
  contactPhone: '+44 7700 900123',
  message: 'Interested in viewing this property',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test JWT token
 */
export const createTestJwtToken = (payload = {}) => {
  const defaultPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'tenant',
    ...payload,
  };
  return `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(defaultPayload)).toString('base64')}.signature`;
};

/**
 * Clean up test data
 */
export const cleanupTestData = async (repositories: Repository<any>[]) => {
  for (const repository of repositories) {
    await repository.clear();
  }
};

// Mock ExecutionContext for testing guards
export const createMockExecutionContext = (requestData: any): ExecutionContext => {
  const mockRequest = {
    headers: {},
    user: undefined,
    ...requestData,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getType: () => 'http',
    getArgs: () => [],
    getArgByIndex: () => ({}),
  } as ExecutionContext;
};

// Mock JWT payload
export const createMockJwtPayload = (overrides: any = {}) => {
  return {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'tenant',
    tenantOrganizationId: 'org-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
};