import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseIndexes1757372000000 implements MigrationInterface {
  name = 'AddDatabaseIndexes1757372000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table indexes - frequently queried fields
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_tenant_organization_id" ON "users" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_is_active" ON "users" ("isActive")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_is_verified" ON "users" ("isVerified")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_last_login_at" ON "users" ("lastLoginAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_created_at" ON "users" ("createdAt")`);
    
    // Composite indexes for common user queries
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_tenant_role" ON "users" ("tenantOrganizationId", "role")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_tenant_active" ON "users" ("tenantOrganizationId", "isActive")`);

    // Properties table indexes - search and filter fields
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_type" ON "properties" ("type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_listing_type" ON "properties" ("listingType")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_status" ON "properties" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_price" ON "properties" ("price")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_bedrooms" ON "properties" ("bedrooms")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_bathrooms" ON "properties" ("bathrooms")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_postcode" ON "properties" ("postcode")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_city" ON "properties" ("city")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_county" ON "properties" ("county")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_tenant_organization_id" ON "properties" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_agent_id" ON "properties" ("agentId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_landlord_id" ON "properties" ("landlordId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_is_active" ON "properties" ("isActive")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_is_featured" ON "properties" ("isFeatured")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_available_from" ON "properties" ("availableFrom")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_created_at" ON "properties" ("createdAt")`);
    
    // Geospatial index for location-based searches
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_location" ON "properties" ("latitude", "longitude")`);
    
    // Composite indexes for common property search queries
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_tenant_status" ON "properties" ("tenantOrganizationId", "status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_tenant_type" ON "properties" ("tenantOrganizationId", "type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_tenant_listing_type" ON "properties" ("tenantOrganizationId", "listingType")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_status_price" ON "properties" ("status", "price")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_type_bedrooms" ON "properties" ("type", "bedrooms")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_city_price" ON "properties" ("city", "price")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_properties_postcode_status" ON "properties" ("postcode", "status")`);

    // Bookings table indexes - already has some indexes but adding more
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_reference_number" ON "bookings" ("referenceNumber")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_created_at" ON "bookings" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_updated_at" ON "updatedAt")`);
    
    // Additional composite indexes for bookings
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_tenant_property_date" ON "bookings" ("tenantOrganizationId", "propertyId", "startDateTime")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_tenant_user_date" ON "bookings" ("tenantOrganizationId", "bookedById", "startDateTime")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_status_date" ON "bookings" ("status", "startDateTime")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_type_date" ON "bookings" ("type", "startDateTime")`);

    // Tenant Organization indexes for multi-tenancy performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_organizations_name" ON "tenant_organizations" ("name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_organizations_is_active" ON "tenant_organizations" ("isActive")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_organizations_created_at" ON "tenant_organizations" ("createdAt")`);

    // Additional indexes for other entities if they exist
    // Payments table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_tenant_organization_id" ON "payments" ("tenantOrganizationId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_status" ON "payments" ("status") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_created_at" ON "payments" ("createdAt") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')`);
    
    // Maintenance requests table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_maintenance_requests_tenant_organization_id" ON "maintenance_requests" ("tenantOrganizationId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_maintenance_requests_property_id" ON "maintenance_requests" ("propertyId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_maintenance_requests_status" ON "maintenance_requests" ("status") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_maintenance_requests_priority" ON "maintenance_requests" ("priority") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests')`);
    
    // Messages table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_tenant_organization_id" ON "messages" ("tenantOrganizationId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_sender_id" ON "messages" ("senderId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_recipient_id" ON "messages" ("recipientId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_created_at" ON "messages" ("createdAt") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    
    // Messages indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_recipient_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_sender_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_tenant_organization_id"`);
    
    // Maintenance requests indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_maintenance_requests_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_maintenance_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_maintenance_requests_property_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_maintenance_requests_tenant_organization_id"`);
    
    // Payments indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_tenant_organization_id"`);
    
    // Tenant organizations indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_organizations_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_organizations_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_organizations_name"`);
    
    // Bookings composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_type_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_status_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_tenant_user_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_tenant_property_date"`);
    
    // Bookings basic indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_updated_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_reference_number"`);
    
    // Properties composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_postcode_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_city_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_type_bedrooms"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_status_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_tenant_listing_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_tenant_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_tenant_status"`);
    
    // Properties location index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_location"`);
    
    // Properties basic indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_available_from"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_is_featured"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_landlord_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_agent_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_tenant_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_county"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_city"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_postcode"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_bathrooms"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_bedrooms"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_listing_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_properties_type"`);
    
    // Users composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_tenant_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_tenant_role"`);
    
    // Users basic indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_last_login_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_is_verified"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_tenant_organization_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
  }
}