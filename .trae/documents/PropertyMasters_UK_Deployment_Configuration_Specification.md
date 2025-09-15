# PropertyMasters UK - Deployment Configuration Specification

**Version:** 1.0  
**Date:** January 2025  
**Project:** Multi-Tenant SaaS Property Platform - Production Deployment Guide  
**Document Type:** Comprehensive Deployment Configuration

***

## 1. Overview

This document provides comprehensive deployment configuration specifications for PropertyMasters UK, covering production deployment to Supabase (backend) and Vercel (frontend), CI/CD pipeline setup, environment management, monitoring, and security configurations.

### 1.1 Deployment Architecture

```mermaid
graph TD
    A[Developer] --> B[GitHub Repository]
    B --> C[GitHub Actions CI/CD]
    C --> D[Build & Test]
    D --> E[Security Scan]
    E --> F[Deploy to Staging]
    F --> G[Integration Tests]
    G --> H[Deploy to Production]
    
    H --> I[Vercel Frontend]
    H --> J[Supabase Backend]
    
    I --> K[CDN Distribution]
    J --> L[PostgreSQL Database]
    J --> M[Authentication Service]
    J --> N[File Storage]
    
    O[Monitoring] --> I
    O --> J
    P[Logging] --> I
    P --> J
    
    subgraph "Production Environment"
        I
        J
        K
        L
        M
        N
    end
    
    subgraph "Observability"
        O
        P
    end
end
```

### 1.2 Deployment Objectives

- **Zero Downtime**: Seamless deployments with no service interruption
- **Scalability**: Auto-scaling based on demand
- **Security**: Secure configuration and data protection
- **Monitoring**: Comprehensive observability and alerting
- **Performance**: Optimized for speed and reliability
- **Compliance**: GDPR and UK data protection compliance

## 2. Environment Configuration

### 2.1 Environment Variables

**Backend Environment Variables (Supabase):**

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Authentication
JWT_SECRET=[jwt-secret-key]
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=[refresh-token-secret]
REFRESH_TOKEN_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1
CORS_ORIGIN=https://propertymastersuk.vercel.app

# External Services
ORDNANCE_SURVEY_API_KEY=[os-api-key]
ORDNANCE_SURVEY_BASE_URL=https://api.os.uk

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=[sentry-dsn]
LOG_LEVEL=info

# Email Configuration
SMTP_HOST=[smtp-host]
SMTP_PORT=587
SMTP_USER=[smtp-user]
SMTP_PASS=[smtp-password]
FROM_EMAIL=noreply@propertymastersuk.com

# Cache Configuration
REDIS_URL=[redis-url]
CACHE_TTL=3600

# Security
HELMET_ENABLED=true
CSP_ENABLED=true
HSTS_MAX_AGE=31536000
```

**Frontend Environment Variables (Vercel):**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://[project-ref].supabase.co/rest/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Application Configuration
NEXT_PUBLIC_APP_NAME=PropertyMasters UK
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[google-maps-key]
NEXT_PUBLIC_ORDNANCE_SURVEY_API_KEY=[os-api-key]

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=[ga-measurement-id]
NEXT_PUBLIC_HOTJAR_ID=[hotjar-id]

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=true
NEXT_PUBLIC_ENABLE_PROPERTY_ALERTS=true

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.propertymastersuk.com
NEXT_PUBLIC_IMAGES_DOMAIN=images.propertymastersuk.com

# Security
NEXT_PUBLIC_CSP_NONCE=[csp-nonce]
```

### 2.2 Environment-Specific Configurations

**Development Environment:**

```typescript
// config/development.ts
export const developmentConfig = {
  database: {
    logging: true,
    synchronize: true,
    dropSchema: false,
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Higher limit for development
  },
  logging: {
    level: 'debug',
    format: 'dev',
  },
};
```

**Staging Environment:**

```typescript
// config/staging.ts
export const stagingConfig = {
  database: {
    logging: false,
    synchronize: false,
    dropSchema: false,
  },
  cors: {
    origin: ['https://staging.propertymastersuk.com'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 200,
  },
  logging: {
    level: 'info',
    format: 'combined',
  },
};
```

**Production Environment:**

```typescript
// config/production.ts
export const productionConfig = {
  database: {
    logging: false,
    synchronize: false,
    dropSchema: false,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  cors: {
    origin: ['https://propertymastersuk.com', 'https://www.propertymastersuk.com'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  logging: {
    level: 'warn',
    format: 'json',
  },
};
```

## 3. CI/CD Pipeline Configuration

### 3.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

jobs:
  test:
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
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          
      - name: Run linting
        run: |
          npm run lint
          cd frontend && npm run lint
          
      - name: Run type checking
        run: |
          npm run type-check
          cd frontend && npm run type-check
          
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Build backend
        run: npm run build
        
      - name: Build frontend
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
  security-scan:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Run CodeQL analysis
        uses: github/codeql-action/init@v3
        with:
          languages: typescript
          
      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v3
        
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Deploy to Supabase Staging
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          scope: ${{ secrets.VERCEL_ORG_ID }}
          
  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://propertymastersuk.com
      
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Deploy database migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend
          scope: ${{ secrets.VERCEL_ORG_ID }}
          
      - name: Run E2E tests against production
        run: |
          npm ci
          npx playwright install --with-deps
          npm run test:e2e:production
        env:
          E2E_BASE_URL: https://propertymastersuk.com
          
      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Production deployment successful! 🚀'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: success()
        
      - name: Notify deployment failure
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Production deployment failed! ❌'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: failure()
```

### 3.2 Deployment Scripts

**Backend Deployment Script:**

```bash
#!/bin/bash
# scripts/deploy-backend.sh

set -e

echo "🚀 Starting backend deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
supabase db push

# Deploy edge functions
echo "⚡ Deploying edge functions..."
supabase functions deploy

# Update environment variables
echo "🔧 Updating environment variables..."
supabase secrets set --env-file .env.production

echo "✅ Backend deployment completed successfully!"
```

**Frontend Deployment Script:**

```bash
#!/bin/bash
# scripts/deploy-frontend.sh

set -e

echo "🚀 Starting frontend deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed successfully!"
```

## 4. Supabase Configuration

### 4.1 Database Configuration

**Connection Pooling:**

```sql
-- Database connection settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

SELECT pg_reload_conf();
```

**Row Level Security (RLS) Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Owners can manage their properties" ON properties
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Agents can view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('agent', 'admin')
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT owner_id FROM properties WHERE id = property_id)
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### 4.2 Edge Functions

**Property Search Function:**

```typescript
// supabase/functions/property-search/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SearchParams {
  query?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  location?: string;
  page?: number;
  limit?: number;
}

serve(async (req) => {
  try {
    const { query, propertyType, minPrice, maxPrice, bedrooms, location, page = 1, limit = 20 } = 
      await req.json() as SearchParams;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let queryBuilder = supabase
      .from('properties')
      .select(`
        *,
        owner:users(id, first_name, last_name, email),
        images:property_images(*),
        bookings:bookings(count)
      `, { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (propertyType) {
      queryBuilder = queryBuilder.eq('property_type', propertyType);
    }

    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', minPrice);
    }

    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', maxPrice);
    }

    if (bedrooms) {
      queryBuilder = queryBuilder.eq('bedrooms', bedrooms);
    }

    if (location) {
      queryBuilder = queryBuilder.or(`
        address->>'city'.ilike.%${location}%,
        address->>'postcode'.ilike.%${location}%
      `);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        properties: data,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

### 4.3 Storage Configuration

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'property-images', true),
  ('documents', 'documents', false),
  ('user-avatars', 'user-avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can manage their property images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 5. Vercel Configuration

### 5.1 Vercel Configuration File

```json
{
  "version": 2,
  "name": "propertymastersuk",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": "@google-maps-api-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://propertymastersuk.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    }
  ]
}
```

### 5.2 Next.js Configuration

```typescript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: [
      'images.propertymastersuk.com',
      'supabase.co',
      'googleusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
              "frame-src 'self' https://www.google.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'propertymastersuk',
  project: 'frontend',
});
```

## 6. Monitoring & Observability

### 6.1 Application Monitoring

**Sentry Configuration:**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**Health Check Endpoints:**

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check database connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
```

### 6.2 Performance Monitoring

**Web Vitals Tracking:**

```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metric),
  }).catch(console.error);
}

export function trackWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 6.3 Logging Configuration

**Structured Logging:**

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'propertymastersuk-frontend',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Http({
      host: 'logs.propertymastersuk.com',
      port: 443,
      path: '/logs',
      ssl: true,
    })
  );
}

export default logger;
```

## 7. Security Configuration

### 7.1 Content Security Policy

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // HSTS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 7.2 API Security

```typescript
// lib/api-security.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsOptions = {
  origin: [
    'https://propertymastersuk.com',
    'https://www.propertymastersuk.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

## 8. Backup & Disaster Recovery

### 8.1 Database Backup Strategy

```sql
-- Automated backup configuration
CREATE OR REPLACE FUNCTION create_backup()
RETURNS void AS $$
BEGIN
  -- Create daily backup
  PERFORM pg_dump(
    'postgresql://postgres:password@localhost:5432/propertymastersuk',
    '/backups/daily/' || to_char(now(), 'YYYY-MM-DD') || '.sql'
  );
  
  -- Clean up old backups (keep 30 days)
  DELETE FROM backup_logs 
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily backups
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT create_backup();');
```

### 8.2 Disaster Recovery Plan

**Recovery Procedures:**

1. **Database Recovery:**
   ```bash
   # Restore from backup
   psql -h localhost -U postgres -d propertymastersuk_recovery < backup.sql
   
   # Verify data integrity
   psql -h localhost -U postgres -d propertymastersuk_recovery -c "SELECT COUNT(*) FROM users;"
   ```

2. **Application Recovery:**
   ```bash
   # Redeploy from last known good commit
   git checkout <last-good-commit>
   npm run deploy:production
   
   # Verify deployment
   curl -f https://propertymastersuk.com/api/health
   ```

3. **DNS Failover:**
   ```bash
   # Update DNS to point to backup infrastructure
   # This would be automated through your DNS provider's API
   ```

## 9. Performance Optimization

### 9.1 Caching Strategy

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
```

### 9.2 CDN Configuration

```typescript
// next.config.js - CDN setup
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.propertymastersuk.com' 
    : '',
  
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};

// lib/image-loader.ts
export default function imageLoader({ src, width, quality }) {
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality || 75).toString(),
  });
  
  return `https://images.propertymastersuk.com/optimize?${params}`;
}
```

## 10. Compliance & Legal

### 10.1 GDPR Compliance

```typescript
// lib/gdpr.ts
export class GDPRService {
  static async exportUserData(userId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId);

    return {
      user: userData,
      properties,
      bookings,
      exportedAt: new Date().toISOString(),
    };
  }

  static async deleteUserData(userId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Anonymize user data instead of hard delete
    await supabase
      .from('users')
      .update({
        email: `deleted-${userId}@deleted.com`,
        first_name: 'Deleted',
        last_name: 'User',
        phone: null,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Log deletion for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'user_data_deletion',
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
  }
}
```

### 10.2 Data Retention Policy

```sql
-- Data retention policies
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete old audit logs (keep 7 years)
  DELETE FROM audit_logs 
  WHERE created_at < now() - interval '7 years';
  
  -- Archive old bookings (keep 3 years active)
  INSERT INTO archived_bookings 
  SELECT * FROM bookings 
  WHERE created_at < now() - interval '3 years';
  
  DELETE FROM bookings 
  WHERE created_at < now() - interval '3 years';
  
  -- Delete old sessions (keep 30 days)
  DELETE FROM user_sessions 
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly cleanup
SELECT cron.schedule('monthly-cleanup', '0 0 1 * *', 'SELECT cleanup_old_data();');
```

***

**Document Control**
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: February 2025
- **Approved By**: DevOps Team
- **Status**: Production Ready