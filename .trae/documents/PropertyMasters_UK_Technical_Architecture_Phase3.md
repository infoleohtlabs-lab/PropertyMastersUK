# PropertyMasters UK - Technical Architecture Document (Phase 3)

**Version:** 3.0  
**Date:** January 2025  
**Project:** Multi-Tenant SaaS Property Platform - Phase 3 Implementation  
**Document Type:** Technical Architecture & Implementation Guide

***

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[Next.js Frontend Application]
    B --> C[Vercel Edge Network]
    C --> D[Supabase Client SDK]
    D --> E[Supabase Backend Services]
    
    B --> F[NestJS Backend API]
    F --> G[Supabase PostgreSQL Database]
    F --> H[Redis Cache Layer]
    F --> I[External UK APIs]
    
    subgraph "Frontend Layer (Vercel)"
        B
        C
    end
    
    subgraph "Backend Layer (Supabase)"
        E
        G
    end
    
    subgraph "API Layer (Production)"
        F
        H
    end
    
    subgraph "External Integrations"
        I
        J[Land Registry API]
        K[Companies House API]
        L[Ordnance Survey API]
        M[Royal Mail PAF API]
        N[Stripe Payment API]
    end
    
    I --> J
    I --> K
    I --> L
    I --> M
    F --> N
end
```

## 2. Technology Description

**Frontend Stack:**
- Next.js@14 + TypeScript@5
- Tailwind CSS@3 + Radix UI
- Zustand for state management
- React Hook Form + Zod validation
- Chart.js for analytics
- Mapbox GL JS for mapping
- Deployed on Vercel

**Backend Stack:**
- NestJS@10 + TypeScript@5
- Supabase (PostgreSQL + Auth + Storage)
- Redis for caching and sessions
- Winston for logging
- Sentry for error tracking
- Jest for testing

**Development & Deployment:**
- Docker for containerization
- GitHub Actions for CI/CD
- ESLint + Prettier for code quality
- Husky for git hooks

## 3. Route Definitions

| Route | Purpose | Authentication Required |
|-------|---------|------------------------|
| / | Landing page with property search | No |
| /properties | Property listing with filters | No |
| /properties/[id] | Property detail page | No |
| /auth/login | User authentication | No |
| /auth/register | User registration | No |
| /dashboard | Role-based dashboard | Yes |
| /dashboard/properties | Property management | Yes (Agent/Landlord) |
| /dashboard/bookings | Booking management | Yes |
| /dashboard/financial | Financial reporting | Yes (Landlord/Admin) |
| /dashboard/maintenance | Maintenance requests | Yes |
| /dashboard/analytics | Market analysis | Yes |
| /profile | User profile management | Yes |
| /api-docs | Swagger API documentation | No |

## 4. API Definitions

### 4.1 Authentication APIs

**User Registration**
```
POST /api/auth/register
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| email | string | true | User email address |
| password | string | true | Password (min 8 chars) |
| firstName | string | true | User first name |
| lastName | string | true | User last name |
| role | enum | true | User role (agent, landlord, tenant, buyer, solicitor) |
| companyName | string | false | Company name (for business users) |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| success | boolean | Registration status |
| user | object | User profile data |
| accessToken | string | JWT access token |
| refreshToken | string | JWT refresh token |

**User Login**
```
POST /api/auth/login
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| email | string | true | User email address |
| password | string | true | User password |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| success | boolean | Login status |
| user | object | User profile data |
| accessToken | string | JWT access token |
| refreshToken | string | JWT refresh token |

### 4.2 Property Management APIs

**Get Properties**
```
GET /api/properties
```

Query Parameters:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| page | number | false | Page number (default: 1) |
| limit | number | false | Items per page (default: 20) |
| search | string | false | Search term |
| propertyType | string | false | Property type filter |
| minPrice | number | false | Minimum price filter |
| maxPrice | number | false | Maximum price filter |
| bedrooms | number | false | Number of bedrooms |
| postcode | string | false | Postcode area filter |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| properties | array | Array of property objects |
| total | number | Total number of properties |
| page | number | Current page number |
| totalPages | number | Total number of pages |

**Create Property**
```
POST /api/properties
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| title | string | true | Property title |
| description | string | true | Property description |
| propertyType | enum | true | Property type |
| price | number | true | Property price |
| bedrooms | number | true | Number of bedrooms |
| bathrooms | number | true | Number of bathrooms |
| address | object | true | Property address |
| features | array | false | Property features |
| images | array | false | Property images |

### 4.3 Booking Management APIs

**Create Booking**
```
POST /api/bookings
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| propertyId | string | true | Property UUID |
| viewingDate | string | true | ISO date string |
| viewingTime | string | true | Time slot |
| contactName | string | true | Contact person name |
| contactEmail | string | true | Contact email |
| contactPhone | string | true | Contact phone |
| message | string | false | Additional message |

### 4.4 Market Analysis APIs

**Get Market Trends**
```
GET /api/market/trends
```

Query Parameters:
| Param Name | Param Type | isRequired | Description |
|------------|------------|------------|-------------|
| postcode | string | true | Postcode area |
| propertyType | string | false | Property type |
| period | string | false | Time period (1m, 3m, 6m, 1y) |

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| trends | array | Price trend data |
| averagePrice | number | Average price in area |
| priceChange | number | Price change percentage |
| marketActivity | object | Market activity metrics |

### 4.5 Integration APIs

**Ordnance Survey Integration**
```
GET /api/integrations/ordnance-survey/postcode/:postcode
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| coordinates | object | Latitude and longitude |
| boundaries | array | Area boundary data |
| amenities | array | Local amenities |
| transport | array | Transport links |

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client Request] --> B[NestJS Controller Layer]
    B --> C[Authentication Guard]
    C --> D[Validation Pipe]
    D --> E[Service Layer]
    E --> F[Repository Layer]
    F --> G[(Supabase PostgreSQL)]
    
    E --> H[Cache Service]
    H --> I[(Redis Cache)]
    
    E --> J[Integration Service]
    J --> K[External APIs]
    
    E --> L[Notification Service]
    L --> M[Email Service]
    L --> N[SMS Service]
    
    subgraph "NestJS Application"
        B
        C
        D
        E
        F
        H
        J
        L
    end
    
    subgraph "Data Layer"
        G
        I
    end
    
    subgraph "External Services"
        K
        M
        N
    end
end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : owns
    USERS ||--o{ BOOKINGS : creates
    USERS ||--o{ MAINTENANCE_REQUESTS : submits
    PROPERTIES ||--o{ BOOKINGS : has
    PROPERTIES ||--o{ PROPERTY_IMAGES : contains
    PROPERTIES ||--o{ MAINTENANCE_REQUESTS : requires
    PROPERTIES ||--o{ TENANCIES : has
    TENANCIES ||--o{ RENT_PAYMENTS : generates
    USERS ||--o{ RENT_PAYMENTS : makes
    USERS ||--o{ DOCUMENTS : uploads
    PROPERTIES ||--o{ MARKET_ANALYSIS : analyzed_by
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role
        string company_name
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }
    
    PROPERTIES {
        uuid id PK
        uuid owner_id FK
        string title
        text description
        enum property_type
        decimal price
        integer bedrooms
        integer bathrooms
        json address
        json features
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    BOOKINGS {
        uuid id PK
        uuid property_id FK
        uuid user_id FK
        datetime viewing_date
        string viewing_time
        string contact_name
        string contact_email
        string contact_phone
        text message
        enum status
        timestamp created_at
    }
    
    TENANCIES {
        uuid id PK
        uuid property_id FK
        uuid tenant_id FK
        uuid landlord_id FK
        date start_date
        date end_date
        decimal monthly_rent
        decimal deposit
        enum status
        timestamp created_at
    }
    
    MAINTENANCE_REQUESTS {
        uuid id PK
        uuid property_id FK
        uuid tenant_id FK
        string title
        text description
        enum priority
        enum status
        decimal estimated_cost
        timestamp created_at
        timestamp updated_at
    }
    
    RENT_PAYMENTS {
        uuid id PK
        uuid tenancy_id FK
        uuid tenant_id FK
        decimal amount
        date due_date
        date paid_date
        enum status
        string payment_method
        string transaction_id
        timestamp created_at
    }
end
```

### 6.2 Data Definition Language

**Users Table**
```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent', 'landlord', 'tenant', 'buyer', 'solicitor')),
    company_name VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
```

**Properties Table**
```sql
-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    address JSONB NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented')),
    coordinates POINT,
    epc_rating VARCHAR(1),
    council_tax_band VARCHAR(1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_address_postcode ON properties USING GIN((address->>'postcode'));

-- Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Properties are viewable by everyone" ON properties
    FOR SELECT USING (status = 'active');

CREATE POLICY "Property owners can manage their properties" ON properties
    FOR ALL USING (auth.uid() = owner_id);

-- Grant permissions
GRANT SELECT ON properties TO anon;
GRANT ALL PRIVILEGES ON properties TO authenticated;
```

**Bookings Table**
```sql
-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewing_date DATE NOT NULL,
    viewing_time TIME NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_viewing_date ON bookings(viewing_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view bookings for their properties" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = bookings.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT ON bookings TO anon;
GRANT ALL PRIVILEGES ON bookings TO authenticated;
```

## 7. Phase 3 Implementation Priorities

### 7.1 API Documentation (Week 7)
- Swagger/OpenAPI setup with NestJS
- Interactive API documentation
- Request/response schema validation
- Authentication flow documentation

### 7.2 Testing Implementation (Week 8)
- Jest unit testing setup
- Integration testing with Supertest
- E2E testing with Playwright
- Code coverage reporting

### 7.3 Ordnance Survey Integration (Week 9)
- Map services integration
- Address validation and autocomplete
- Location-based search enhancement
- Geographic data enrichment

### 7.4 Advanced Features (Week 10)
- Virtual tours integration
- Market analysis tools
- Financial management enhancement
- Performance optimization

## 8. Deployment Configuration

### 8.1 Production Environment
- **Frontend**: Vercel (deployed)
- **Backend**: Supabase (deployed)
- **Database**: Supabase PostgreSQL
- **Cache**: Redis Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Supabase Analytics

### 8.2 Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Redis Configuration
REDIS_URL=redis://user:password@host:port

# External APIs
ORDNANCE_SURVEY_API_KEY=your-os-api-key
LAND_REGISTRY_API_KEY=your-lr-api-key
COMPANIES_HOUSE_API_KEY=your-ch-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### 8.3 Security Configuration
- JWT secret rotation
- API rate limiting
- CORS configuration
- Security headers
- Input validation
- SQL injection prevention

***

**Document Control**
- **Version**: 3.0
- **Last Updated**: January 2025
- **Next Review**: February 2025
- **Approved By**: Development Team
- **Status**: Phase 3 Implementation Ready