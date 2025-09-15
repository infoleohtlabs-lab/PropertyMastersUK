-- PropertyMasters UK Initial Database Schema
-- This migration creates the core tables for the property management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'agent', 'client')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'apartment', 'commercial', 'land')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'pending')),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    square_meters INTEGER,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postcode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'United Kingdom',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location GEOGRAPHY(POINT, 4326),
    agent_id UUID REFERENCES public.users(id),
    featured BOOLEAN DEFAULT false,
    virtual_tour_url TEXT,
    video_tour_url TEXT,
    energy_rating VARCHAR(2),
    council_tax_band VARCHAR(1),
    tenure VARCHAR(20) CHECK (tenure IN ('freehold', 'leasehold', 'shared_ownership')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property images table
CREATE TABLE public.property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property features table
CREATE TABLE public.property_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    inquiry_type VARCHAR(20) DEFAULT 'general' CHECK (inquiry_type IN ('viewing', 'purchase', 'rental', 'general')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viewings table
CREATE TABLE public.viewings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    agent_id UUID REFERENCES public.users(id),
    viewing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Saved searches table
CREATE TABLE public.saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    email_alerts BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties USING GIST(location);
CREATE INDEX idx_properties_agent ON public.properties(agent_id);
CREATE INDEX idx_properties_featured ON public.properties(featured);
CREATE INDEX idx_property_images_property ON public.property_images(property_id);
CREATE INDEX idx_inquiries_property ON public.inquiries(property_id);
CREATE INDEX idx_inquiries_user ON public.inquiries(user_id);
CREATE INDEX idx_viewings_property ON public.viewings(property_id);
CREATE INDEX idx_viewings_user ON public.viewings(user_id);
CREATE INDEX idx_viewings_date ON public.viewings(viewing_date);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_saved_searches_user ON public.saved_searches(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viewings_updated_at BEFORE UPDATE ON public.viewings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view agent profiles" ON public.users FOR SELECT USING (role = 'agent');

-- Properties policies
CREATE POLICY "Anyone can view available properties" ON public.properties FOR SELECT USING (status = 'available');
CREATE POLICY "Agents can manage their own properties" ON public.properties FOR ALL USING (auth.uid() = agent_id);
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Property images policies
CREATE POLICY "Anyone can view property images" ON public.property_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND status = 'available')
);
CREATE POLICY "Property agents can manage images" ON public.property_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND agent_id = auth.uid())
);

-- Property features policies
CREATE POLICY "Anyone can view property features" ON public.property_features FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND status = 'available')
);
CREATE POLICY "Property agents can manage features" ON public.property_features FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND agent_id = auth.uid())
);

-- Inquiries policies
CREATE POLICY "Users can view their own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Property agents can view inquiries for their properties" ON public.inquiries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND agent_id = auth.uid())
);
CREATE POLICY "Property agents can update inquiries for their properties" ON public.inquiries FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND agent_id = auth.uid())
);

-- Viewings policies
CREATE POLICY "Users can view their own viewings" ON public.viewings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can view their assigned viewings" ON public.viewings FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Users can create viewings" ON public.viewings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents can manage viewings" ON public.viewings FOR ALL USING (auth.uid() = agent_id);

-- Favorites policies
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anonymous users (for public property viewing)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.property_images TO anon;
GRANT SELECT ON public.property_features TO anon;
GRANT SELECT ON public.users TO anon;