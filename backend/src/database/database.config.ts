import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  const isTest = configService.get('NODE_ENV') === 'test';
  const dbType = configService.get<string>('DB_TYPE', 'postgres') as any;

  // Base configuration
  const baseConfig: any = {
    type: dbType,
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations',
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', isDevelopment),
    logging: configService.get<boolean>('DB_LOGGING', isDevelopment) ? ['query', 'error', 'warn'] : ['error'],
  };

  // Database-specific configuration
  if (dbType === 'sqlite') {
    return {
      ...baseConfig,
      database: configService.get<string>('DB_DATABASE', ':memory:'),
      dropSchema: isTest, // Drop schema for tests
    };
  }

  // PostgreSQL configuration
  return {
    ...baseConfig,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'propertymastersuk'),
    
    // Migration configuration
    migrationsRun: isProduction, // Auto-run migrations in production
    
    // Connection settings
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    
    // Optimized connection pooling
    extra: {
      // Connection pool settings
      max: isProduction ? 20 : 10, // Maximum connections in pool
      min: isProduction ? 5 : 2,   // Minimum connections in pool
      acquire: 60000,               // Maximum time to get connection (60s)
      idle: 10000,                  // Maximum idle time before releasing (10s)
      evict: 1000,                  // How often to check for idle connections (1s)
      
      // Connection timeout settings
      connectionTimeoutMillis: 30000, // Connection timeout (30s)
      idleTimeoutMillis: 30000,       // Idle timeout (30s)
      
      // Query settings
      query_timeout: 30000,           // Query timeout (30s)
      statement_timeout: 30000,       // Statement timeout (30s)
      
      // Performance optimizations
      application_name: 'PropertyMastersUK',
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
    },
    
    // Performance settings
    cache: {
      duration: 30000, // 30 seconds
    },
    
    // Multi-tenant support
    schema: 'public',
  };
};

// DataSource for migrations (CLI usage)
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'propertymastersuk',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false, // Never sync in CLI mode
  logging: ['error'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export const dataSource = new DataSource(dataSourceOptions);
