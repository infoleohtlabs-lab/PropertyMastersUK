-- PropertyMasters UK Database Initialization Script

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE propertymastersuk'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'propertymastersuk')\gexec

-- Connect to the database
\c propertymastersuk;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types/enums that might be needed
DO $$ 
BEGIN
    -- User roles
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'agent', 'landlord', 'tenant', 'buyer');
    END IF;
    
    -- Property types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM ('house', 'apartment', 'flat', 'studio', 'commercial', 'land');
    END IF;
    
    -- Property status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
        CREATE TYPE property_status AS ENUM ('available', 'under_offer', 'sold', 'rented', 'withdrawn');
    END IF;
    
    -- Listing types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM ('sale', 'rent', 'both');
    END IF;
    
    -- Booking status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
    END IF;
    
    -- Payment status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
    END IF;
    
    -- Document status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
    END IF;
    
    -- Notification types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'booking_confirmed', 'booking_cancelled', 'booking_reminder',
            'property_inquiry', 'property_viewed', 'property_favorited',
            'message_received', 'document_uploaded', 'payment_received',
            'payment_due', 'maintenance_request', 'system_update',
            'marketing_offer', 'gdpr_request'
        );
    END IF;
    
    -- Communication types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'communication_type') THEN
        CREATE TYPE communication_type AS ENUM ('email', 'phone', 'sms', 'in_person', 'video_call', 'letter', 'other');
    END IF;
END $$;

-- Create indexes for common search patterns
-- These will be created by TypeORM migrations, but we can prepare some basic ones

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a function for full-text search
CREATE OR REPLACE FUNCTION create_search_vector(title TEXT, description TEXT, address TEXT)
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE propertymastersuk TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN