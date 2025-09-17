-- Land Registry API Integration Database Schema
-- Creates tables for property ownership, price paid data, and API management

-- Rename existing properties table to avoid conflict
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        -- Check if uprn column exists (Land Registry table)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'uprn' AND table_schema = 'public') THEN
            -- This is the original properties table, rename it
            ALTER TABLE properties RENAME TO property_listings;
        END IF;
    END IF;
END $$;

-- Create properties table for Land Registry data
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uprn VARCHAR(20) UNIQUE,
    title_number VARCHAR(20) UNIQUE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    postcode VARCHAR(10) NOT NULL,
    property_type VARCHAR(1) CHECK (property_type IN ('D', 'S', 'T', 'F', 'O')),
    tenure VARCHAR(1) CHECK (tenure IN ('F', 'L')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE
);

-- Create ownership_records table
CREATE TABLE IF NOT EXISTS ownership_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    owner_name VARCHAR(255) NOT NULL,
    owner_address TEXT,
    company_number VARCHAR(20),
    ownership_type VARCHAR(20) CHECK (ownership_type IN ('individual', 'company', 'trust', 'other')),
    registration_date DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price_paid_records table
CREATE TABLE IF NOT EXISTS price_paid_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    transfer_date DATE NOT NULL,
    property_type VARCHAR(1) CHECK (property_type IN ('D', 'S', 'T', 'F', 'O')),
    new_build BOOLEAN DEFAULT false,
    duration VARCHAR(1) CHECK (duration IN ('F', 'L')),
    paon VARCHAR(255),
    saon VARCHAR(255),
    street VARCHAR(255),
    locality VARCHAR(255),
    city VARCHAR(255),
    district VARCHAR(255),
    county VARCHAR(255),
    category_type VARCHAR(1) CHECK (category_type IN ('A', 'B')),
    record_status VARCHAR(1) CHECK (record_status IN ('A', 'C', 'D')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create title_records table
CREATE TABLE IF NOT EXISTS title_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title_number VARCHAR(20) UNIQUE NOT NULL,
    property_description TEXT,
    tenure VARCHAR(1) CHECK (tenure IN ('F', 'L')),
    registration_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ownership_history table
CREATE TABLE IF NOT EXISTS ownership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ownership_record_id UUID NOT NULL REFERENCES ownership_records(id) ON DELETE CASCADE,
    previous_owner VARCHAR(255),
    change_date DATE,
    change_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_status INTEGER NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk_exports table
CREATE TABLE IF NOT EXISTS bulk_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    export_id VARCHAR(50) UNIQUE NOT NULL,
    search_criteria JSONB,
    format VARCHAR(20) CHECK (format IN ('csv', 'excel', 'json')),
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    download_url TEXT,
    record_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for properties table
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_uprn ON properties(uprn);
CREATE INDEX IF NOT EXISTS idx_properties_title_number ON properties(title_number);
CREATE INDEX IF NOT EXISTS idx_properties_last_sync ON properties(last_sync);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);

-- Create indexes for ownership_records table
CREATE INDEX IF NOT EXISTS idx_ownership_records_property_id ON ownership_records(property_id);
CREATE INDEX IF NOT EXISTS idx_ownership_records_is_current ON ownership_records(is_current);
CREATE INDEX IF NOT EXISTS idx_ownership_records_owner_name ON ownership_records(owner_name);
CREATE INDEX IF NOT EXISTS idx_ownership_records_ownership_type ON ownership_records(ownership_type);

-- Create indexes for price_paid_records table
CREATE INDEX IF NOT EXISTS idx_price_paid_property_id ON price_paid_records(property_id);
CREATE INDEX IF NOT EXISTS idx_price_paid_transfer_date ON price_paid_records(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_paid_price ON price_paid_records(price);
CREATE INDEX IF NOT EXISTS idx_price_paid_transaction_id ON price_paid_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_price_paid_postcode ON price_paid_records(property_id);

-- Create indexes for title_records table
CREATE INDEX IF NOT EXISTS idx_title_records_property_id ON title_records(property_id);
CREATE INDEX IF NOT EXISTS idx_title_records_title_number ON title_records(title_number);

-- Create indexes for api_usage_logs table
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- Create indexes for bulk_exports table
CREATE INDEX IF NOT EXISTS idx_bulk_exports_user_id ON bulk_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_exports_export_id ON bulk_exports(export_id);
CREATE INDEX IF NOT EXISTS idx_bulk_exports_status ON bulk_exports(status);
CREATE INDEX IF NOT EXISTS idx_bulk_exports_created_at ON bulk_exports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_paid_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_exports ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role (public read access for basic property data)
GRANT SELECT ON properties TO anon;
GRANT SELECT ON price_paid_records TO anon;

-- Grant permissions to authenticated role
GRANT ALL PRIVILEGES ON properties TO authenticated;
GRANT ALL PRIVILEGES ON ownership_records TO authenticated;
GRANT ALL PRIVILEGES ON price_paid_records TO authenticated;
GRANT ALL PRIVILEGES ON title_records TO authenticated;
GRANT ALL PRIVILEGES ON ownership_history TO authenticated;
GRANT ALL PRIVILEGES ON api_usage_logs TO authenticated;
GRANT ALL PRIVILEGES ON bulk_exports TO authenticated;

-- Create RLS policies

-- Public properties are viewable by everyone
CREATE POLICY "Public properties are viewable by everyone" ON properties
    FOR SELECT USING (true);

-- Public price paid records are viewable by everyone
CREATE POLICY "Public price paid records are viewable by everyone" ON price_paid_records
    FOR SELECT USING (true);

-- Users can view their own API logs
CREATE POLICY "Users can view their own API logs" ON api_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own API logs
CREATE POLICY "Users can insert their own API logs" ON api_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own bulk exports
CREATE POLICY "Users can view their own bulk exports" ON bulk_exports
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bulk exports
CREATE POLICY "Users can insert their own bulk exports" ON bulk_exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bulk exports
CREATE POLICY "Users can update their own bulk exports" ON bulk_exports
    FOR UPDATE USING (auth.uid() = user_id);

-- Authenticated users can view ownership records
CREATE POLICY "Authenticated users can view ownership records" ON ownership_records
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can view title records
CREATE POLICY "Authenticated users can view title records" ON title_records
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can view ownership history
CREATE POLICY "Authenticated users can view ownership history" ON ownership_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can manage all data
CREATE POLICY "Service role can manage all data" ON properties
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage ownership records" ON ownership_records
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage price paid records" ON price_paid_records
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage title records" ON title_records
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage ownership history" ON ownership_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ownership_records_updated_at BEFORE UPDATE ON ownership_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for property search with Land Registry data
CREATE OR REPLACE FUNCTION search_properties_with_land_registry(
    search_postcode TEXT DEFAULT NULL,
    search_address TEXT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    property_types TEXT[] DEFAULT NULL,
    date_from DATE DEFAULT NULL,
    date_to DATE DEFAULT NULL,
    limit_count INTEGER DEFAULT 100,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    property_id UUID,
    uprn VARCHAR(20),
    title_number VARCHAR(20),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    postcode VARCHAR(10),
    property_type VARCHAR(1),
    tenure VARCHAR(1),
    latest_price DECIMAL(12,2),
    latest_sale_date DATE,
    current_owner VARCHAR(255),
    ownership_type VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.uprn,
        p.title_number,
        p.address_line_1,
        p.address_line_2,
        p.postcode,
        p.property_type,
        p.tenure,
        latest_sale.price,
        latest_sale.transfer_date,
        current_ownership.owner_name,
        current_ownership.ownership_type
    FROM properties p
    LEFT JOIN (
        SELECT DISTINCT ON (property_id) 
            property_id, price, transfer_date
        FROM price_paid_records
        WHERE record_status = 'A'
        ORDER BY property_id, transfer_date DESC
    ) latest_sale ON p.id = latest_sale.property_id
    LEFT JOIN (
        SELECT DISTINCT ON (property_id)
            property_id, owner_name, ownership_type
        FROM ownership_records
        WHERE is_current = true
        ORDER BY property_id, created_at DESC
    ) current_ownership ON p.id = current_ownership.property_id
    WHERE 
        (search_postcode IS NULL OR p.postcode ILIKE '%' || search_postcode || '%')
        AND (search_address IS NULL OR 
             p.address_line_1 ILIKE '%' || search_address || '%' OR
             p.address_line_2 ILIKE '%' || search_address || '%')
        AND (min_price IS NULL OR latest_sale.price >= min_price)
        AND (max_price IS NULL OR latest_sale.price <= max_price)
        AND (property_types IS NULL OR p.property_type = ANY(property_types))
        AND (date_from IS NULL OR latest_sale.transfer_date >= date_from)
        AND (date_to IS NULL OR latest_sale.transfer_date <= date_to)
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get property price history
CREATE OR REPLACE FUNCTION get_property_price_history(
    property_uprn VARCHAR(20)
)
RETURNS TABLE (
    transaction_id VARCHAR(50),
    price DECIMAL(12,2),
    transfer_date DATE,
    property_type VARCHAR(1),
    new_build BOOLEAN,
    duration VARCHAR(1)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ppr.transaction_id,
        ppr.price,
        ppr.transfer_date,
        ppr.property_type,
        ppr.new_build,
        ppr.duration
    FROM price_paid_records ppr
    JOIN properties p ON ppr.property_id = p.id
    WHERE p.uprn = property_uprn
        AND ppr.record_status = 'A'
    ORDER BY ppr.transfer_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get ownership history
CREATE OR REPLACE FUNCTION get_ownership_history(
    property_title_number VARCHAR(20)
)
RETURNS TABLE (
    owner_name VARCHAR(255),
    owner_address TEXT,
    company_number VARCHAR(20),
    ownership_type VARCHAR(20),
    registration_date DATE,
    is_current BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        or_rec.owner_name,
        or_rec.owner_address,
        or_rec.company_number,
        or_rec.ownership_type,
        or_rec.registration_date,
        or_rec.is_current
    FROM ownership_records or_rec
    JOIN properties p ON or_rec.property_id = p.id
    WHERE p.title_number = property_title_number
    ORDER BY or_rec.registration_date DESC, or_rec.is_current DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (optional)
-- This can be removed in production
INSERT INTO properties (uprn, title_number, address_line_1, postcode, property_type, tenure) VALUES
('100023336956', 'SY123456', '123 Sample Street', 'SW1A 1AA', 'T', 'F'),
('100023336957', 'SY123457', '124 Sample Street', 'SW1A 1AA', 'S', 'F'),
('100023336958', 'SY123458', '125 Sample Street', 'SW1A 1AA', 'D', 'F')
ON CONFLICT (uprn) DO NOTHING;

-- Add comment for migration tracking
COMMENT ON TABLE properties IS 'Land Registry properties data with UPRN and title number mapping';
COMMENT ON TABLE ownership_records IS 'Property ownership information from Land Registry';
COMMENT ON TABLE price_paid_records IS 'Historical property transaction data from Land Registry';
COMMENT ON TABLE title_records IS 'Property title information and legal descriptions';
COMMENT ON TABLE api_usage_logs IS 'API usage tracking for Land Registry endpoints';
COMMENT ON TABLE bulk_exports IS 'Bulk data export requests and status tracking';