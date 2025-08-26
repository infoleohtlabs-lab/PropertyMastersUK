import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const runSimpleSeed = async () => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || 'propertymastersuk.db',
    synchronize: false,
    logging: true,
  });

  try {
    console.log('🚀 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Create basic tables manually
    console.log('🏗️ Creating basic tables...');
    
    // Create users table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL DEFAULT 'tenant',
        "isActive" BOOLEAN DEFAULT true,
        "isVerified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create agents table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES users(id),
        "licenseNumber" VARCHAR(100),
        "agencyName" VARCHAR(255),
        "specializations" TEXT[],
        "yearsExperience" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create properties table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        address VARCHAR(255),
        postcode VARCHAR(20),
        city VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created');

    // Insert seed data
    console.log('🌱 Inserting seed data...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert users
    await dataSource.query(`
      INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "isVerified", phone)
      VALUES 
        ('admin@propertymastersuk.com', $1, 'Admin', 'User', 'admin', true, true, '+44 20 1234 5678'),
        ('agent@propertymastersuk.com', $1, 'John', 'Smith', 'agent', true, true, '+44 20 1234 5679'),
        ('landlord@propertymastersuk.com', $1, 'Sarah', 'Johnson', 'landlord', true, true, '+44 20 1234 5680'),
        ('tenant@propertymastersuk.com', $1, 'Mike', 'Wilson', 'tenant', true, true, '+44 20 1234 5681'),
        ('buyer@propertymastersuk.com', $1, 'Emma', 'Davis', 'buyer', true, true, '+44 20 1234 5682'),
        ('solicitor@propertymastersuk.com', $1, 'James', 'Brown', 'solicitor', true, true, '+44 20 1234 5683')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);

    // Get user IDs
    const agentUser = await dataSource.query(`SELECT id FROM users WHERE email = 'agent@propertymastersuk.com'`);
    
    if (agentUser.length > 0) {
      // Insert agent
      await dataSource.query(`
        INSERT INTO agents ("userId", "licenseNumber", "agencyName", specializations, "yearsExperience")
        VALUES ($1, 'LIC123456', 'Property Masters UK', ARRAY['residential', 'commercial'], 5)
        ON CONFLICT DO NOTHING;
      `, [agentUser[0].id]);
    }

    // Insert properties
    await dataSource.query(`
      INSERT INTO properties (title, description, type, status, price, bedrooms, bathrooms, address, postcode, city)
      VALUES 
        ('Modern 2-Bed Apartment', 'Beautiful modern apartment in central London', 'apartment', 'available', 450000.00, 2, 2, '123 Main Street', 'SW1A 1AA', 'London'),
        ('Victorian House', 'Charming Victorian house with garden', 'house', 'available', 750000.00, 3, 2, '456 Oak Avenue', 'SW2 2BB', 'London')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Seed data inserted successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
};

runSimpleSeed();