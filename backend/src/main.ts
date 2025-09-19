import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { initializeSentry } from './logging/sentry.config';
import { GlobalExceptionFilter } from './logging/global-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  // Initialize Sentry
  const configService = app.get(ConfigService);
  initializeSentry(configService);

  // Use Winston as the global logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Register global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security headers with helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Enable CORS
  const appConfig = configService.get<AppConfig>('app');
  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('PropertyMasters UK API')
    .setDescription(`
      Comprehensive Property Management Platform API for the UK market.
      
      Features:
      - Multi-tenant SaaS architecture
      - Role-based access control (Admin, Agent, Landlord, Tenant, Buyer, Solicitor)
      - Property management and listings
      - Tenancy and lease management
      - Financial tracking and reporting
      - UK-specific integrations (Ordnance Survey, Land Registry)
      - Real-time notifications and messaging
      
      Authentication:
      - JWT Bearer tokens for API access
      - Role-based permissions
      - Secure session management
    `)
    .setVersion('3.0')
    .setContact(
      'PropertyMasters UK Support',
      'https://propertymasters.uk/support',
      'support@propertymasters.uk'
    )
    .setLicense(
      'Proprietary',
      'https://propertymasters.uk/license'
    )
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api-staging.propertymasters.uk', 'Staging Server')
    .addServer('https://api.propertymasters.uk', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for external integrations',
      },
      'API-Key',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Properties', 'Property management and listings')
    .addTag('Users', 'User management and profiles')
    .addTag('Tenancies', 'Tenancy and lease management')
    .addTag('Financial', 'Financial tracking and reporting')
    .addTag('Bookings', 'Property viewing and booking management')
    .addTag('Maintenance', 'Property maintenance and repairs')
    .addTag('Documents', 'Document management and storage')
    .addTag('Notifications', 'Real-time notifications and messaging')
    .addTag('Analytics', 'Business intelligence and reporting')
    .addTag('Integrations', 'External service integrations')
    .build();
    
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });
  
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PropertyMasters UK API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('/logo.png'); width: 120px; height: auto; }
      .swagger-ui .topbar { background-color: #1e40af; }
      .swagger-ui .info .title { color: #1e40af; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
