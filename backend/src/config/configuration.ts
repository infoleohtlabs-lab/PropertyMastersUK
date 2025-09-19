export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface EmailConfig {
  sendgridApiKey?: string;
  fromEmail: string;
}

export interface AwsConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
  s3Bucket?: string;
}

export interface StripeConfig {
  secretKey?: string;
  webhookSecret?: string;
}

export interface SecurityConfig {
  rateLimitTtl: number;
  rateLimitMax: number;
  accountLockoutAttempts: number;
  accountLockoutDuration: number;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  version: string;
  corsOrigins: string[];
}

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    version: process.env.APP_VERSION || '1.0.0',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  } as AppConfig,

  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  } as DatabaseConfig,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as JwtConfig,

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  } as RedisConfig,

  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
  } as EmailConfig,

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-west-2',
    s3Bucket: process.env.AWS_S3_BUCKET,
  } as AwsConfig,

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  } as StripeConfig,

  security: {
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    accountLockoutAttempts: parseInt(process.env.ACCOUNT_LOCKOUT_ATTEMPTS, 10) || 5,
    accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION, 10) || 900,
  } as SecurityConfig,

  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
  },

  externalApis: {
    rightmoveApiKey: process.env.RIGHTMOVE_API_KEY,
    ordnanceSurveyApiKey: process.env.ORDNANCE_SURVEY_API_KEY,
  },
});
