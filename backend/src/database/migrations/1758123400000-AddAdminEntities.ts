import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminEntities1758123400000 implements MigrationInterface {
  name = 'AddAdminEntities1758123400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admin_activity_logs table
    await queryRunner.query(`
      CREATE TABLE "admin_activity_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "action" character varying(255) NOT NULL,
        "details" text,
        "ipAddress" character varying(45),
        "userAgent" text,
        "metadata" jsonb,
        "severity" character varying(20) NOT NULL DEFAULT 'info',
        "category" character varying(100) NOT NULL DEFAULT 'general',
        "resourceType" character varying(100),
        "resourceId" character varying(255),
        "archived" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_activity_logs" PRIMARY KEY ("id")
      )
    `);

    // Create system_configs table
    await queryRunner.query(`
      CREATE TABLE "system_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(255) NOT NULL,
        "value" text,
        "category" character varying(100) NOT NULL DEFAULT 'general',
        "type" character varying(50) NOT NULL DEFAULT 'string',
        "isEncrypted" boolean NOT NULL DEFAULT false,
        "isEditable" boolean NOT NULL DEFAULT true,
        "validationRules" jsonb,
        "defaultValue" text,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_system_configs_key" UNIQUE ("key")
      )
    `);

    // Create import_jobs table
    await queryRunner.query(`
      CREATE TABLE "import_jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying(255) NOT NULL,
        "filepath" text NOT NULL,
        "fileSize" bigint NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'uploaded',
        "uploadedBy" uuid NOT NULL,
        "metadata" jsonb,
        "validationResults" jsonb,
        "stats" jsonb,
        "processingErrors" text[],
        "errorMessage" text,
        "validationStartedAt" TIMESTAMP,
        "validationCompletedAt" TIMESTAMP,
        "processingStartedAt" TIMESTAMP,
        "processingCompletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_import_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_import_jobs_status" CHECK ("status" IN (
          'uploaded', 'validating', 'validated', 'validation_failed',
          'processing', 'completed', 'processing_failed', 'cancelled'
        ))
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "admin_activity_logs"
      ADD CONSTRAINT "FK_admin_activity_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "import_jobs"
      ADD CONSTRAINT "FK_import_jobs_uploadedBy"
      FOREIGN KEY ("uploadedBy") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_userId" ON "admin_activity_logs" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_action" ON "admin_activity_logs" ("action")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_category" ON "admin_activity_logs" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_createdAt" ON "admin_activity_logs" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_resourceType" ON "admin_activity_logs" ("resourceType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_admin_activity_logs_resourceId" ON "admin_activity_logs" ("resourceId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_system_configs_category" ON "system_configs" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_system_configs_type" ON "system_configs" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_import_jobs_status" ON "import_jobs" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_import_jobs_uploadedBy" ON "import_jobs" ("uploadedBy")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_import_jobs_createdAt" ON "import_jobs" ("createdAt")
    `);

    // Insert default system configurations
    await queryRunner.query(`
      INSERT INTO "system_configs" ("key", "value", "category", "type", "description", "defaultValue") VALUES
      ('app.name', 'PropertyMasters UK', 'general', 'string', 'Application name', 'PropertyMasters UK'),
      ('app.version', '1.0.0', 'general', 'string', 'Application version', '1.0.0'),
      ('app.maintenance_mode', 'false', 'general', 'boolean', 'Enable maintenance mode', 'false'),
      ('app.max_file_upload_size', '52428800', 'general', 'number', 'Maximum file upload size in bytes (50MB)', '52428800'),
      ('email.smtp_host', '', 'email', 'string', 'SMTP server host', ''),
      ('email.smtp_port', '587', 'email', 'number', 'SMTP server port', '587'),
      ('email.smtp_secure', 'false', 'email', 'boolean', 'Use secure SMTP connection', 'false'),
      ('email.from_address', 'noreply@propertymastersuk.com', 'email', 'string', 'Default from email address', 'noreply@propertymastersuk.com'),
      ('email.from_name', 'PropertyMasters UK', 'email', 'string', 'Default from name', 'PropertyMasters UK'),
      ('security.session_timeout', '3600', 'security', 'number', 'Session timeout in seconds', '3600'),
      ('security.max_login_attempts', '5', 'security', 'number', 'Maximum login attempts before lockout', '5'),
      ('security.lockout_duration', '900', 'security', 'number', 'Account lockout duration in seconds', '900'),
      ('security.password_min_length', '8', 'security', 'number', 'Minimum password length', '8'),
      ('security.require_2fa', 'false', 'security', 'boolean', 'Require two-factor authentication', 'false'),
      ('backup.auto_backup_enabled', 'true', 'backup', 'boolean', 'Enable automatic backups', 'true'),
      ('backup.backup_frequency', 'daily', 'backup', 'string', 'Backup frequency (daily, weekly, monthly)', 'daily'),
      ('backup.retention_days', '30', 'backup', 'number', 'Backup retention period in days', '30'),
      ('api.rate_limit_requests', '1000', 'api', 'number', 'API rate limit requests per hour', '1000'),
      ('api.rate_limit_window', '3600', 'api', 'number', 'API rate limit window in seconds', '3600'),
      ('notifications.email_enabled', 'true', 'notifications', 'boolean', 'Enable email notifications', 'true'),
      ('notifications.sms_enabled', 'false', 'notifications', 'boolean', 'Enable SMS notifications', 'false'),
      ('land_registry.import_batch_size', '1000', 'land_registry', 'number', 'Batch size for Land Registry imports', '1000'),
      ('land_registry.max_file_size', '52428800', 'land_registry', 'number', 'Maximum Land Registry file size in bytes', '52428800'),
      ('land_registry.allowed_formats', 'csv', 'land_registry', 'string', 'Allowed file formats for Land Registry import', 'csv')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "import_jobs" DROP CONSTRAINT "FK_import_jobs_uploadedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "admin_activity_logs" DROP CONSTRAINT "FK_admin_activity_logs_userId"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_import_jobs_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_import_jobs_uploadedBy"`);
    await queryRunner.query(`DROP INDEX "IDX_import_jobs_status"`);
    await queryRunner.query(`DROP INDEX "IDX_system_configs_type"`);
    await queryRunner.query(`DROP INDEX "IDX_system_configs_category"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_resourceId"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_resourceType"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_category"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_action"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_activity_logs_userId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "import_jobs"`);
    await queryRunner.query(`DROP TABLE "system_configs"`);
    await queryRunner.query(`DROP TABLE "admin_activity_logs"`);
  }
}