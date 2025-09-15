import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create tenant_organizations table (core multi-tenant table)
    await queryRunner.query(`
      CREATE TABLE "tenant_organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "subdomain" character varying NOT NULL,
        "customDomain" character varying,
        "logo" character varying,
        "primaryColor" character varying,
        "secondaryColor" character varying,
        "status" character varying NOT NULL DEFAULT 'trial',
        "subscriptionPlan" character varying NOT NULL DEFAULT 'starter',
        "subscriptionStartDate" TIMESTAMP,
        "subscriptionEndDate" TIMESTAMP,
        "maxUsers" integer NOT NULL DEFAULT 10,
        "maxProperties" integer NOT NULL DEFAULT 100,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "address" character varying,
        "city" character varying,
        "postcode" character varying,
        "country" character varying,
        "companyRegistrationNumber" character varying,
        "vatNumber" character varying,
        "settings" json,
        "features" json,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_organizations_name" UNIQUE ("name"),
        CONSTRAINT "UQ_tenant_organizations_subdomain" UNIQUE ("subdomain"),
        CONSTRAINT "UQ_tenant_organizations_customDomain" UNIQUE ("customDomain")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying,
        "password" character varying,
        "firstName" character varying,
        "lastName" character varying,
        "phone" character varying,
        "role" character varying NOT NULL DEFAULT 'tenant',
        "isActive" boolean NOT NULL DEFAULT true,
        "isVerified" boolean NOT NULL DEFAULT false,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" character varying,
        "passwordResetToken" character varying,
        "passwordResetTokenExpiry" TIMESTAMP,
        "lastLoginAt" TIMESTAMP,
        "profilePicture" character varying,
        "avatar" character varying,
        "address" character varying,
        "dateOfBirth" TIMESTAMP,
        "preferredLanguage" character varying NOT NULL DEFAULT 'en',
        "emailNotifications" boolean NOT NULL DEFAULT true,
        "smsNotifications" boolean NOT NULL DEFAULT true,
        "tenantOrganizationId" uuid,
        "permissions" json,
        "department" character varying,
        "jobTitle" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Create properties table
    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantOrganizationId" uuid NOT NULL,
        "ownerId" uuid,
        "title" character varying NOT NULL,
        "description" text,
        "type" character varying NOT NULL DEFAULT 'house',
        "status" character varying NOT NULL DEFAULT 'available',
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "postcode" character varying NOT NULL,
        "country" character varying NOT NULL DEFAULT 'UK',
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "bedrooms" integer,
        "bathrooms" integer,
        "receptions" integer,
        "floorArea" numeric(8,2),
        "plotSize" numeric(8,2),
        "yearBuilt" integer,
        "price" numeric(12,2),
        "rentPrice" numeric(8,2),
        "deposit" numeric(8,2),
        "councilTax" character varying,
        "epcRating" character varying,
        "furnished" character varying,
        "parking" character varying,
        "garden" boolean DEFAULT false,
        "balcony" boolean DEFAULT false,
        "terrace" boolean DEFAULT false,
        "images" json,
        "features" json,
        "nearbyAmenities" json,
        "transportLinks" json,
        "isActive" boolean NOT NULL DEFAULT true,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "viewCount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_properties" PRIMARY KEY ("id")
      )
    `);

    // Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantOrganizationId" uuid NOT NULL,
        "propertyId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "agentId" uuid,
        "bookingReference" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'viewing',
        "status" character varying NOT NULL DEFAULT 'pending',
        "scheduledDate" TIMESTAMP NOT NULL,
        "duration" integer NOT NULL DEFAULT 60,
        "notes" text,
        "attendees" json,
        "reminderSent" boolean NOT NULL DEFAULT false,
        "confirmationSent" boolean NOT NULL DEFAULT false,
        "feedback" text,
        "rating" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_bookings_reference" UNIQUE ("bookingReference")
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantOrganizationId" uuid NOT NULL,
        "userId" uuid,
        "propertyId" uuid,
        "bookingId" uuid,
        "paymentReference" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'rent',
        "status" character varying NOT NULL DEFAULT 'pending',
        "method" character varying NOT NULL DEFAULT 'bank_transfer',
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'GBP',
        "description" text,
        "dueDate" TIMESTAMP,
        "paidDate" TIMESTAMP,
        "stripePaymentIntentId" character varying,
        "stripeChargeId" character varying,
        "metadata" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_reference" UNIQUE ("paymentReference")
      )
    `);

    // Create tenancies table
    await queryRunner.query(`
      CREATE TABLE "tenancies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantOrganizationId" uuid NOT NULL,
        "propertyId" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "landlordId" uuid,
        "agentId" uuid,
        "status" character varying NOT NULL DEFAULT 'pending',
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "rentAmount" numeric(8,2) NOT NULL,
        "depositAmount" numeric(8,2) NOT NULL,
        "paymentFrequency" character varying NOT NULL DEFAULT 'monthly',
        "paymentDueDay" integer NOT NULL DEFAULT 1,
        "contractType" character varying NOT NULL DEFAULT 'assured_shorthold',
        "furnished" character varying,
        "petsAllowed" boolean DEFAULT false,
        "smokingAllowed" boolean DEFAULT false,
        "notes" text,
        "documents" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenancies" PRIMARY KEY ("id")
      )
    `);

    // Create maintenance_requests table
    await queryRunner.query(`
      CREATE TABLE "maintenance_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantOrganizationId" uuid NOT NULL,
        "propertyId" uuid NOT NULL,
        "tenantId" uuid,
        "landlordId" uuid,
        "assignedContractorId" uuid,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "category" character varying NOT NULL,
        "priority" character varying NOT NULL DEFAULT 'medium',
        "status" character varying NOT NULL DEFAULT 'open',
        "urgency" character varying NOT NULL DEFAULT 'normal',
        "estimatedCost" numeric(8,2),
        "actualCost" numeric(8,2),
        "scheduledDate" TIMESTAMP,
        "completedDate" TIMESTAMP,
        "images" json,
        "documents" json,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_maintenance_requests" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_users_tenant_organization" ON "users" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_properties_tenant_organization" ON "properties" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_status" ON "properties" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_type" ON "properties" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_city" ON "properties" ("city")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_postcode" ON "properties" ("postcode")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_bookings_tenant_organization" ON "bookings" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_property" ON "bookings" ("propertyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_user" ON "bookings" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_status" ON "bookings" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_date" ON "bookings" ("scheduledDate")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_payments_tenant_organization" ON "payments" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_user" ON "payments" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_property" ON "payments" ("propertyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_type" ON "payments" ("type")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_tenancies_tenant_organization" ON "tenancies" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenancies_property" ON "tenancies" ("propertyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenancies_tenant" ON "tenancies" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenancies_status" ON "tenancies" ("status")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_maintenance_tenant_organization" ON "maintenance_requests" ("tenantOrganizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_maintenance_property" ON "maintenance_requests" ("propertyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_maintenance_status" ON "maintenance_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_maintenance_priority" ON "maintenance_requests" ("priority")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" 
      ADD CONSTRAINT "FK_properties_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" 
      ADD CONSTRAINT "FK_properties_owner" 
      FOREIGN KEY ("ownerId") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_property" 
      FOREIGN KEY ("propertyId") 
      REFERENCES "properties"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_user" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenancies" 
      ADD CONSTRAINT "FK_tenancies_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenancies" 
      ADD CONSTRAINT "FK_tenancies_property" 
      FOREIGN KEY ("propertyId") 
      REFERENCES "properties"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "maintenance_requests" 
      ADD CONSTRAINT "FK_maintenance_tenant_organization" 
      FOREIGN KEY ("tenantOrganizationId") 
      REFERENCES "tenant_organizations"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "maintenance_requests" 
      ADD CONSTRAINT "FK_maintenance_property" 
      FOREIGN KEY ("propertyId") 
      REFERENCES "properties"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "maintenance_requests" DROP CONSTRAINT "FK_maintenance_property"`);
    await queryRunner.query(`ALTER TABLE "maintenance_requests" DROP CONSTRAINT "FK_maintenance_tenant_organization"`);
    await queryRunner.query(`ALTER TABLE "tenancies" DROP CONSTRAINT "FK_tenancies_property"`);
    await queryRunner.query(`ALTER TABLE "tenancies" DROP CONSTRAINT "FK_tenancies_tenant_organization"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_tenant_organization"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_property"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_tenant_organization"`);
    await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_owner"`);
    await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_tenant_organization"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenant_organization"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_maintenance_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_maintenance_status"`);
    await queryRunner.query(`DROP INDEX "IDX_maintenance_property"`);
    await queryRunner.query(`DROP INDEX "IDX_maintenance_tenant_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_tenancies_status"`);
    await queryRunner.query(`DROP INDEX "IDX_tenancies_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_tenancies_property"`);
    await queryRunner.query(`DROP INDEX "IDX_tenancies_tenant_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_type"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_status"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_property"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_user"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_tenant_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_date"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_status"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_user"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_property"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_tenant_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_postcode"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_city"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_type"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_status"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_tenant_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "IDX_users_tenant_organization"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "maintenance_requests"`);
    await queryRunner.query(`DROP TABLE "tenancies"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "properties"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenant_organizations"`);
  }
}