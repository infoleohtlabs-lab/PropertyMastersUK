# PropertyMasters UK - API Documentation Specification

**Version:** 1.0  
**Date:** January 2025  
**Project:** Multi-Tenant SaaS Property Platform - API Documentation  
**Document Type:** API Documentation & Swagger Implementation Guide

***

## 1. Overview

This document outlines the comprehensive API documentation strategy for PropertyMasters UK, focusing on Swagger/OpenAPI 3.0 implementation with interactive documentation, automated testing, and developer experience optimization.

### 1.1 Documentation Objectives

- **Interactive API Documentation**: Provide a comprehensive, interactive API reference
- **Developer Experience**: Enable easy API exploration and testing
- **Automated Validation**: Ensure API contracts are maintained and validated
- **Integration Support**: Facilitate third-party integrations and partnerships
- **Compliance**: Meet industry standards for API documentation

## 2. Swagger/OpenAPI Implementation

### 2.1 NestJS Swagger Configuration

**Installation Dependencies:**
```bash
npm install @nestjs/swagger swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

**Main Configuration (main.ts):**
```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('PropertyMasters UK API')
    .setDescription('Comprehensive API for PropertyMasters UK multi-tenant SaaS platform')
    .setVersion('3.0')
    .setContact(
      'PropertyMasters UK Support',
      'https://propertymasters.uk/support',
      'api-support@propertymasters.uk'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('https://api.propertymasters.uk', 'Production Server')
    .addServer('https://staging-api.propertymasters.uk', 'Staging Server')
    .addServer('http://localhost:3000', 'Development Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for external integrations',
      },
      'API-Key'
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });
  
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'PropertyMasters UK API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });
  
  await app.listen(3000);
}
bootstrap();
```

### 2.2 API Documentation Structure

**Tag Organization:**
- **Authentication**: User registration, login, password management
- **Properties**: Property CRUD operations, search, filtering
- **Bookings**: Viewing bookings, calendar management
- **Users**: User profile management, role-based operations
- **Financial**: Payment processing, financial reporting
- **Maintenance**: Maintenance request management
- **Market Analysis**: Property valuation, market trends
- **Integrations**: External API integrations (OS, Land Registry)
- **Admin**: Administrative operations, system management

### 2.3 DTO Documentation Standards

**Example: Property Creation DTO**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  BUNGALOW = 'bungalow',
  COMMERCIAL = 'commercial',
}

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property title',
    example: 'Beautiful 3-bedroom house in Central London',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed property description',
    example: 'A stunning Victorian house with modern amenities...',
    minLength: 50,
    maxLength: 2000,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.HOUSE,
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({
    description: 'Property price in GBP',
    example: 750000,
    minimum: 1000,
    maximum: 50000000,
  })
  @IsNumber()
  @Min(1000)
  @Max(50000000)
  @Transform(({ value }) => parseInt(value))
  price: number;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 3,
    minimum: 0,
    maximum: 20,
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  bathrooms: number;

  @ApiProperty({
    description: 'Property address information',
    example: {
      street: '123 Main Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
    },
  })
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };

  @ApiPropertyOptional({
    description: 'Property features and amenities',
    example: ['parking', 'garden', 'balcony', 'gym'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
```

### 2.4 Controller Documentation Standards

**Example: Properties Controller**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all properties',
    description: 'Retrieve a paginated list of properties with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for property title or description',
    example: 'London apartment',
  })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    enum: PropertyType,
    description: 'Filter by property type',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
    example: 100000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
    example: 1000000,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Properties retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        properties: {
          type: 'array',
          items: { $ref: '#/components/schemas/Property' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 8 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async findAll(@Query() query: GetPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new property',
    description: 'Create a new property listing (requires authentication)',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Property created successfully',
    type: Property,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid property data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by ID',
    description: 'Retrieve detailed information about a specific property',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Property UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Property retrieved successfully',
    type: Property,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Property not found',
  })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }
}
```

## 3. API Response Standards

### 3.1 Success Response Format

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### 3.2 Error Response Format

```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}
```

### 3.3 Standard HTTP Status Codes

| Status Code | Usage | Description |
|-------------|-------|-------------|
| 200 | GET, PUT | Successful operation |
| 201 | POST | Resource created successfully |
| 204 | DELETE | Resource deleted successfully |
| 400 | All | Bad request - invalid input |
| 401 | All | Unauthorized - authentication required |
| 403 | All | Forbidden - insufficient permissions |
| 404 | GET, PUT, DELETE | Resource not found |
| 409 | POST, PUT | Conflict - resource already exists |
| 422 | POST, PUT | Unprocessable entity - validation failed |
| 429 | All | Too many requests - rate limit exceeded |
| 500 | All | Internal server error |

## 4. Authentication Documentation

### 4.1 JWT Authentication Flow

```yaml
components:
  securitySchemes:
    JWT-auth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT authentication flow:
        1. Login with email/password to get access token
        2. Include token in Authorization header: `Bearer <token>`
        3. Token expires in 15 minutes
        4. Use refresh token to get new access token
        
        Example:
        ```
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        ```
    
    API-Key:
      type: apiKey
      in: header
      name: X-API-Key
      description: |
        API Key for external integrations and webhooks.
        Contact support to obtain an API key.
        
        Example:
        ```
        X-API-Key: pk_live_1234567890abcdef
        ```
```

### 4.2 Role-Based Access Control

| Role | Permissions | API Access |
|------|-------------|------------|
| Admin | Full system access | All endpoints |
| Agent | Property and client management | Properties, Bookings, Users (limited) |
| Landlord | Portfolio management | Properties (own), Tenancies, Financial |
| Tenant | Tenant portal access | Profile, Bookings (own), Maintenance |
| Buyer | Property search and booking | Properties (read), Bookings (own) |
| Solicitor | Legal document access | Properties (read), Legal documents |

## 5. API Testing & Validation

### 5.1 Postman Collection Generation

**Automated Collection Export:**
```typescript
// scripts/generate-postman-collection.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generatePostmanCollection() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('PropertyMasters UK API')
    .setVersion('3.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Convert OpenAPI to Postman collection
  const postmanCollection = convertOpenApiToPostman(document);
  
  // Save collection
  const outputPath = path.join(__dirname, '../docs/postman-collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));
  
  console.log('Postman collection generated:', outputPath);
  await app.close();
}

generatePostmanCollection();
```

### 5.2 API Contract Testing

**Jest API Tests:**
```typescript
// test/api/properties.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Properties API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
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

  describe('/properties (GET)', () => {
    it('should return paginated properties', () => {
      return request(app.getHttpServer())
        .get('/properties')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('properties');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.properties)).toBe(true);
        });
    });

    it('should filter properties by type', () => {
      return request(app.getHttpServer())
        .get('/properties?propertyType=house')
        .expect(200)
        .expect((res) => {
          res.body.properties.forEach((property) => {
            expect(property.propertyType).toBe('house');
          });
        });
    });
  });

  describe('/properties (POST)', () => {
    it('should create a new property', () => {
      const propertyData = {
        title: 'Test Property',
        description: 'A beautiful test property with amazing features',
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
      };

      return request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(propertyData.title);
          expect(res.body.price).toBe(propertyData.price);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toHaveProperty('message');
          expect(res.body.error.message).toContain('validation');
        });
    });
  });
});
```

## 6. Documentation Deployment

### 6.1 Static Documentation Generation

**Redoc Integration:**
```typescript
// Generate static HTML documentation
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateStaticDocs() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('PropertyMasters UK API')
    .setVersion('3.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Generate Redoc HTML
  const redocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PropertyMasters UK API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <redoc spec-url="./openapi.json"></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `;
  
  // Save files
  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(docsDir, 'openapi.json'), JSON.stringify(document, null, 2));
  fs.writeFileSync(path.join(docsDir, 'index.html'), redocHtml);
  
  console.log('Static documentation generated in /docs');
  await app.close();
}

generateStaticDocs();
```

### 6.2 CI/CD Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/api-docs.yml
name: API Documentation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate API documentation
        run: npm run docs:generate
        
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 7. Performance & Monitoring

### 7.1 API Performance Metrics

- **Response Time**: Target < 200ms for 95th percentile
- **Throughput**: Support 1000+ requests per minute
- **Error Rate**: Maintain < 1% error rate
- **Availability**: 99.9% uptime SLA

### 7.2 Documentation Analytics

- Track API endpoint usage
- Monitor documentation page views
- Collect developer feedback
- Measure API adoption rates

***

**Document Control**
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: February 2025
- **Approved By**: Development Team
- **Status**: Implementation Ready