-- Role-Based Access Control Migration
-- Migration version: 006
-- Description: Implement comprehensive RLS policies for new role hierarchy
-- Roles: SUPER_ADMIN, ADMIN, PROPERTY_MANAGER, CONTRACTOR, SELLER, BUYER, CLIENT

-- =============================================
-- UPDATE USER ROLES
-- =============================================

-- First, update the users table to support new roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PROPERTY_MANAGER', 'CONTRACTOR', 'SELLER', 'BUYER', 'CLIENT', 'AGENT'));

-- Add role hierarchy level for easier permission checking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_level INTEGER DEFAULT 1;

-- Update role levels based on hierarchy
UPDATE public.users SET role_level = CASE 
  WHEN role = 'SUPER_ADMIN' THEN 100
  WHEN role = 'ADMIN' THEN 90
  WHEN role = 'PROPERTY_MANAGER' THEN 80
  WHEN role = 'AGENT' THEN 70
  WHEN role = 'CONTRACTOR' THEN 60
  WHEN role = 'SELLER' THEN 50
  WHEN role = 'BUYER' THEN 40
  WHEN role = 'CLIENT' THEN 30
  ELSE 10
END;

-- Add organization_id for multi-tenant support
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- CREATE HELPER FUNCTIONS
-- =============================================

-- Function to check if user has minimum role level
CREATE OR REPLACE FUNCTION auth.user_has_role_level(min_level INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role_level >= min_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION auth.user_has_any_role(roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to same organization
CREATE OR REPLACE FUNCTION auth.same_organization(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u1, public.users u2
    WHERE u1.id = auth.uid() 
    AND u2.id = target_user_id
    AND (u1.organization_id = u2.organization_id OR u1.organization_id IS NULL OR u2.organization_id IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DROP EXISTING POLICIES
-- =============================================

-- Drop all existing policies to recreate with new role system
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view agent profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can manage their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Property agents can manage images" ON public.property_images;
DROP POLICY IF EXISTS "Anyone can view property features" ON public.property_features;
DROP POLICY IF EXISTS "Property agents can manage features" ON public.property_features;
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Property agents can view inquiries for their properties" ON public.inquiries;
DROP POLICY IF EXISTS "Property agents can update inquiries for their properties" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view their own viewings" ON public.viewings;
DROP POLICY IF EXISTS "Agents can view their assigned viewings" ON public.viewings;
DROP POLICY IF EXISTS "Users can create viewings" ON public.viewings;
DROP POLICY IF EXISTS "Agents can manage viewings" ON public.viewings;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their own saved searches" ON public.saved_searches;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- SUPER_ADMIN can view and manage all users
CREATE POLICY "users_super_admin_all" ON public.users FOR ALL 
USING (auth.user_has_role('SUPER_ADMIN'));

-- ADMIN can view and manage users in their organization
CREATE POLICY "users_admin_org" ON public.users FOR ALL 
USING (
  auth.user_has_role('ADMIN') AND 
  auth.same_organization(id)
);

-- PROPERTY_MANAGER can view staff and contractors
CREATE POLICY "users_property_manager_view" ON public.users FOR SELECT 
USING (
  auth.user_has_role('PROPERTY_MANAGER') AND 
  role IN ('CONTRACTOR', 'AGENT', 'CLIENT') AND
  auth.same_organization(id)
);

-- Public can view agent and seller profiles for property listings
CREATE POLICY "users_public_agents_sellers" ON public.users FOR SELECT 
USING (role IN ('AGENT', 'SELLER'));

-- =============================================
-- PROPERTIES TABLE POLICIES
-- =============================================

-- Public can view available properties
CREATE POLICY "properties_public_available" ON public.properties FOR SELECT 
USING (status IN ('available', 'pending'));

-- SUPER_ADMIN can manage all properties
CREATE POLICY "properties_super_admin_all" ON public.properties FOR ALL 
USING (auth.user_has_role('SUPER_ADMIN'));

-- ADMIN can manage properties in their organization
CREATE POLICY "properties_admin_org" ON public.properties FOR ALL 
USING (
  auth.user_has_role('ADMIN') AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = agent_id AND auth.same_organization(agent_id)
  )
);

-- PROPERTY_MANAGER can manage properties they oversee
CREATE POLICY "properties_property_manager" ON public.properties FOR ALL 
USING (
  auth.user_has_role('PROPERTY_MANAGER') AND 
  (
    auth.uid() = agent_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = agent_id AND auth.same_organization(agent_id)
    )
  )
);

-- SELLER can manage their own properties
CREATE POLICY "properties_seller_own" ON public.properties FOR ALL 
USING (
  auth.user_has_role('SELLER') AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND id = agent_id
  )
);

-- AGENT can manage their assigned properties
CREATE POLICY "properties_agent_assigned" ON public.properties FOR ALL 
USING (
  auth.user_has_role('AGENT') AND 
  auth.uid() = agent_id
);

-- BUYER can view available properties
CREATE POLICY "properties_buyer_view" ON public.properties FOR SELECT 
USING (
  auth.user_has_role('BUYER') AND 
  status IN ('available', 'pending')
);

-- =============================================
-- PROPERTY IMAGES POLICIES
-- =============================================

-- Public can view images of available properties
CREATE POLICY "property_images_public" ON public.property_images FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id AND status IN ('available', 'pending')
  )
);

-- Property managers can manage images
CREATE POLICY "property_images_managers" ON public.property_images FOR ALL 
USING (
  auth.user_has_role_level(70) AND 
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id AND 
    (
      agent_id = auth.uid() OR
      auth.user_has_role_level(80)
    )
  )
);

-- =============================================
-- MAINTENANCE REQUESTS POLICIES
-- =============================================

-- Enable RLS on maintenance tables if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests') THEN
    ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
    
    -- SUPER_ADMIN and ADMIN can view all maintenance requests
    CREATE POLICY "maintenance_super_admin" ON public.maintenance_requests FOR ALL 
    USING (auth.user_has_role_level(90));
    
    -- PROPERTY_MANAGER can view requests for their properties
    CREATE POLICY "maintenance_property_manager" ON public.maintenance_requests FOR ALL 
    USING (
      auth.user_has_role('PROPERTY_MANAGER') AND 
      EXISTS (
        SELECT 1 FROM public.properties 
        WHERE id = property_id AND 
        (
          agent_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = agent_id AND auth.same_organization(agent_id)
          )
        )
      )
    );
    
    -- CONTRACTOR can view assigned requests
    CREATE POLICY "maintenance_contractor" ON public.maintenance_requests FOR SELECT 
    USING (
      auth.user_has_role('CONTRACTOR') AND 
      contractor_id = auth.uid()
    );
    
    -- CONTRACTOR can update assigned requests
    CREATE POLICY "maintenance_contractor_update" ON public.maintenance_requests FOR UPDATE 
    USING (
      auth.user_has_role('CONTRACTOR') AND 
      contractor_id = auth.uid()
    );
    
    -- Tenants can view and create their own requests
    CREATE POLICY "maintenance_tenant" ON public.maintenance_requests FOR ALL 
    USING (
      tenant_id = auth.uid()
    );
    
    -- Landlords can view requests for their properties
    CREATE POLICY "maintenance_landlord" ON public.maintenance_requests FOR SELECT 
    USING (
      landlord_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.properties 
        WHERE id = property_id AND agent_id = auth.uid()
      )
    );
  END IF;
END $$;

-- =============================================
-- FINANCIAL TRANSACTIONS POLICIES
-- =============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
    ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
    
    -- SUPER_ADMIN can view all transactions
    CREATE POLICY "financial_super_admin" ON public.financial_transactions FOR ALL 
    USING (auth.user_has_role('SUPER_ADMIN'));
    
    -- ADMIN can view organization transactions
    CREATE POLICY "financial_admin" ON public.financial_transactions FOR ALL 
    USING (
      auth.user_has_role('ADMIN') AND 
      auth.same_organization(user_id)
    );
    
    -- PROPERTY_MANAGER can view property-related transactions
    CREATE POLICY "financial_property_manager" ON public.financial_transactions FOR SELECT 
    USING (
      auth.user_has_role('PROPERTY_MANAGER') AND 
      (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.properties 
          WHERE id = property_id AND 
          (
            agent_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = agent_id AND auth.same_organization(agent_id)
            )
          )
        )
      )
    );
    
    -- Users can view their own transactions
    CREATE POLICY "financial_own" ON public.financial_transactions FOR SELECT 
    USING (user_id = auth.uid());
    
    -- CONTRACTOR can view their payment transactions
    CREATE POLICY "financial_contractor" ON public.financial_transactions FOR SELECT 
    USING (
      auth.user_has_role('CONTRACTOR') AND 
      user_id = auth.uid() AND 
      transaction_type IN ('commission', 'fee', 'income')
    );
  END IF;
END $$;

-- =============================================
-- TENANCIES POLICIES
-- =============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenancies') THEN
    ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;
    
    -- SUPER_ADMIN can manage all tenancies
    CREATE POLICY "tenancies_super_admin" ON public.tenancies FOR ALL 
    USING (auth.user_has_role('SUPER_ADMIN'));
    
    -- PROPERTY_MANAGER can manage tenancies for their properties
    CREATE POLICY "tenancies_property_manager" ON public.tenancies FOR ALL 
    USING (
      auth.user_has_role_level(80) AND 
      (
        agent_id = auth.uid() OR
        landlord_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.properties 
          WHERE id = property_id AND agent_id = auth.uid()
        )
      )
    );
    
    -- Tenants can view their own tenancies
    CREATE POLICY "tenancies_tenant" ON public.tenancies FOR SELECT 
    USING (tenant_id = auth.uid());
    
    -- Landlords can view their properties' tenancies
    CREATE POLICY "tenancies_landlord" ON public.tenancies FOR SELECT 
    USING (landlord_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- CONTRACTORS TABLE POLICIES
-- =============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contractors') THEN
    ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
    
    -- SUPER_ADMIN and ADMIN can manage all contractors
    CREATE POLICY "contractors_admin" ON public.contractors FOR ALL 
    USING (auth.user_has_role_level(90));
    
    -- PROPERTY_MANAGER can view and manage contractors
    CREATE POLICY "contractors_property_manager" ON public.contractors FOR ALL 
    USING (auth.user_has_role('PROPERTY_MANAGER'));
    
    -- CONTRACTOR can view and update their own profile
    CREATE POLICY "contractors_own" ON public.contractors FOR ALL 
    USING (
      auth.user_has_role('CONTRACTOR') AND 
      user_id = auth.uid()
    );
    
    -- Public can view verified contractors
    CREATE POLICY "contractors_public" ON public.contractors FOR SELECT 
    USING (is_verified = true);
  END IF;
END $$;

-- =============================================
-- WORK ORDERS POLICIES
-- =============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_orders') THEN
    ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
    
    -- SUPER_ADMIN can manage all work orders
    CREATE POLICY "work_orders_super_admin" ON public.work_orders FOR ALL 
    USING (auth.user_has_role('SUPER_ADMIN'));
    
    -- PROPERTY_MANAGER can manage work orders for their properties
    CREATE POLICY "work_orders_property_manager" ON public.work_orders FOR ALL 
    USING (
      auth.user_has_role('PROPERTY_MANAGER') AND 
      EXISTS (
        SELECT 1 FROM public.maintenance_requests mr
        JOIN public.properties p ON mr.property_id = p.id
        WHERE mr.id = maintenance_request_id AND 
        (
          p.agent_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = p.agent_id AND auth.same_organization(p.agent_id)
          )
        )
      )
    );
    
    -- CONTRACTOR can view and update their assigned work orders
    CREATE POLICY "work_orders_contractor" ON public.work_orders FOR ALL 
    USING (
      auth.user_has_role('CONTRACTOR') AND 
      contractor_id = auth.uid()
    );
  END IF;
END $$;

-- =============================================
-- INQUIRIES POLICIES (Updated)
-- =============================================

-- Users can view their own inquiries
CREATE POLICY "inquiries_own" ON public.inquiries FOR ALL 
USING (user_id = auth.uid());

-- Property managers can view inquiries for their properties
CREATE POLICY "inquiries_property_manager" ON public.inquiries FOR ALL 
USING (
  auth.user_has_role_level(70) AND 
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id AND 
    (
      agent_id = auth.uid() OR
      auth.user_has_role_level(80)
    )
  )
);

-- SUPER_ADMIN can view all inquiries
CREATE POLICY "inquiries_super_admin" ON public.inquiries FOR ALL 
USING (auth.user_has_role('SUPER_ADMIN'));

-- =============================================
-- VIEWINGS POLICIES (Updated)
-- =============================================

-- Users can manage their own viewings
CREATE POLICY "viewings_own" ON public.viewings FOR ALL 
USING (user_id = auth.uid());

-- Agents can manage their assigned viewings
CREATE POLICY "viewings_agent" ON public.viewings FOR ALL 
USING (
  auth.user_has_role_level(70) AND 
  agent_id = auth.uid()
);

-- Property managers can view all viewings for their properties
CREATE POLICY "viewings_property_manager" ON public.viewings FOR ALL 
USING (
  auth.user_has_role('PROPERTY_MANAGER') AND 
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id AND 
    (
      agent_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = agent_id AND auth.same_organization(agent_id)
      )
    )
  )
);

-- =============================================
-- FAVORITES AND SAVED SEARCHES (Updated)
-- =============================================

-- Users can manage their own favorites
CREATE POLICY "favorites_own" ON public.favorites FOR ALL 
USING (user_id = auth.uid());

-- Users can manage their own saved searches
CREATE POLICY "saved_searches_own" ON public.saved_searches FOR ALL 
USING (user_id = auth.uid());

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;

-- Grant limited permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.property_images TO anon;
GRANT SELECT ON public.property_features TO anon;
GRANT SELECT ON public.users TO anon;

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_role_level ON public.users(role_level);
CREATE INDEX IF NOT EXISTS idx_users_organization ON public.users(organization_id);

-- =============================================
-- AUDIT LOGGING
-- =============================================

-- Create audit log table for tracking access
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only SUPER_ADMIN and ADMIN can view audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs FOR SELECT 
USING (auth.user_has_role_level(90));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_users ON public.users;
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_properties ON public.properties;
CREATE TRIGGER audit_properties
    AFTER INSERT OR UPDATE OR DELETE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Update existing users to have proper role levels if they don't
UPDATE public.users SET role_level = CASE 
  WHEN role = 'admin' THEN 90
  WHEN role = 'agent' THEN 70
  WHEN role = 'client' THEN 30
  ELSE 10
END WHERE role_level IS NULL OR role_level = 1;

-- Log migration completion
INSERT INTO public.audit_logs (action, table_name, new_values) 
VALUES ('MIGRATION', 'role_based_access_control', '{"version": "006", "completed_at": "' || NOW() || '"}');