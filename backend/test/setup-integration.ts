// Set environment variables before any imports
process.env.DATABASE_TYPE = 'sqlite';
process.env.NODE_ENV = 'test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { PropertiesService } from '../src/properties/properties.service';
import { AuthController } from '../src/auth/auth.controller';
import { UsersController } from '../src/users/users.controller';
import { PropertiesController } from '../src/properties/properties.controller';
import { SecurityConfigService } from '../src/auth/config/security.config';
import { PasswordService } from '../src/auth/services/password.service';
import { TokenService } from '../src/auth/services/token.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../src/auth/strategies/local.strategy';
import { User } from '../src/users/entities/user.entity';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { Property } from '../src/properties/entities/property.entity';
import { MarketAnalysis } from '../src/properties/entities/market-analysis.entity';
import { TenantOrganization } from '../src/common/entities/tenant-organization.entity';
import { FileUpload } from '../src/file-upload/entities/file-upload.entity';
import { QueryOptimizationService } from '../src/database/query-optimization.service';
import { PerformanceMonitoringService } from '../src/database/performance-monitoring.service';
import { FileUploadService } from '../src/file-upload/file-upload.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/config/configuration';
import { envValidationSchema } from '../src/config/env.validation';

// Global test setup for Integration tests
let app: INestApplication;
let dataSource: DataSource;
let isSetupComplete = false;

// Setup function to be called by test files
export const setupIntegrationTest = async (): Promise<{ app: INestApplication; dataSource: DataSource }> => {
  if (isSetupComplete) {
    return { app, dataSource };
  }
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-integration-tests';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  // Use SQLite in-memory database for testing
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_DATABASE = ':memory:';
  
  // Required environment variables for validation (not used with SQLite)
  process.env.DB_HOST = 'localhost';
  process.env.DB_USERNAME = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'test';
  process.env.FROM_EMAIL = 'test@example.com';
  
  // Mock services to avoid circular dependencies
  class MockQueryOptimizationService {
    async searchUsersOptimized() {
      return { users: [], total: 0, page: 1, limit: 10 };
    }
    async searchPropertiesOptimized() {
      return { properties: [], total: 0, page: 1, limit: 10 };
    }
  }

  class MockFileUploadService {
    async uploadFile() {
      return { id: 'mock-file-id', filename: 'mock-file.jpg', url: 'mock-url' };
    }
  }

  class MockPasswordService {
    async hashPassword(password: string) {
      return `hashed_${password}`;
    }
    async comparePassword(password: string, hash: string) {
      return hash === `hashed_${password}`;
    }
  }

  class MockTokenService {
    generateEmailVerificationToken() {
      return 'mock-verification-token';
    }
    generatePasswordResetToken() {
      return 'mock-reset-token';
    }
    async generateTokenPair() {
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
    }
    async refreshAccessToken() {
      return {
        accessToken: 'mock-new-access-token',
        refreshToken: 'mock-new-refresh-token'
      };
    }
    async revokeToken() {
      return;
    }
    async revokeAllUserTokens() {
      return;
    }
  }
  
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration],
        validationSchema: envValidationSchema,
        validationOptions: {
          allowUnknown: true,
          abortEarly: false,
        },
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [User, RefreshToken, Property, MarketAnalysis, TenantOrganization],
        synchronize: true,
        dropSchema: true,
        logging: false,
        autoLoadEntities: false, // Disable auto-loading to prevent Booking entity inclusion
      }),
      TypeOrmModule.forFeature([User, RefreshToken, Property, MarketAnalysis, TenantOrganization]),
      JwtModule.register({
        secret: 'test-secret',
        signOptions: { expiresIn: '1h' },
      }),
      PassportModule,
      // Note: Creating minimal test setup without importing full modules to avoid circular dependencies
    ],
    providers: [
      {
        provide: AuthService,
        useValue: {
          validateUser: jest.fn(),
          login: jest.fn(),
          register: jest.fn(),
        },
      },
      {
        provide: UsersService,
        useValue: {
          findByEmail: jest.fn(),
          create: jest.fn(),
          findOne: jest.fn(),
        },
      },
      {
        provide: PropertiesService,
        useValue: {
          findAll: jest.fn(),
          findOne: jest.fn(),
          create: jest.fn(),
        },
      },
      SecurityConfigService,
      JwtStrategy,
      LocalStrategy,
      {
        provide: QueryOptimizationService,
        useValue: {
          searchUsersOptimized: jest.fn(),
          searchPropertiesOptimized: jest.fn(),
        },
      },
      {
        provide: PerformanceMonitoringService,
        useValue: {
          logQuery: jest.fn(),
          getMetrics: jest.fn(),
        },
      },
      {
        provide: PasswordService,
        useClass: MockPasswordService,
      },
      {
        provide: TokenService,
        useClass: MockTokenService,
      },
      {
        provide: getRepositoryToken(User),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(RefreshToken),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(Property),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(MarketAnalysis),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(TenantOrganization),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(FileUpload),
        useClass: Repository,
      },
    ],
    controllers: [AuthController, UsersController, PropertiesController],
  })
  .overrideProvider(QueryOptimizationService)
  .useClass(MockQueryOptimizationService)
  .overrideProvider(FileUploadService)
  .useClass(MockFileUploadService)
  .compile();

  app = moduleFixture.createNestApplication();
  
  // Apply the same configuration as in main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  
  // Get the DataSource after app initialization
  dataSource = app.get(DataSource);
  
  isSetupComplete = true;
  return { app, dataSource };
};

// Getter functions to access initialized instances
export const getApp = (): INestApplication => {
  if (!app) {
    throw new Error('App not initialized. Make sure to call setupIntegrationTest() first.');
  }
  return app;
};

export const getDataSource = (): DataSource => {
  if (!dataSource) {
    throw new Error('DataSource not initialized. Make sure to call setupIntegrationTest() first.');
  }
  return dataSource;
};

beforeEach(async () => {
  // Clean database before each test
  if (dataSource && dataSource.isInitialized) {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
  if (app) {
    await app.close();
  }
});