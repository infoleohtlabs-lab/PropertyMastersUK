import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  isVerified: boolean;
}

interface SeedProperty {
  title: string;
  description: string;
  type: string;
  listingType: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  receptionRooms: number;
  squareFeet: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county: string;
  postcode: string;
  latitude: number;
  longitude: number;
  councilTaxBand: string;
  epcRating: string;
  tenure: string;
  furnishingType: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  studentsAllowed: boolean;
  dssAccepted: boolean;
  deposit: number;
  availableFrom: string;
  images: string[];
  amenities: string[];
}

const runComprehensiveSeed = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'propertymastersuk',
    synchronize: false,
    logging: true,
  });

  try {
    console.log('🚀 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    console.log('🏗️ Using existing database schema...');

    // Insert comprehensive seed data
    console.log('🌱 Inserting comprehensive seed data...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Comprehensive user data
    const users: SeedUser[] = [
      {
        email: 'admin@propertymastersuk.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '+44 20 7946 0958',
        isVerified: true
      },
      {
        email: 'john.smith@propertymastersuk.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'agent',
        phone: '+44 20 7946 0959',
        isVerified: true
      },
      {
        email: 'sarah.johnson@propertymastersuk.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'agent',
        phone: '+44 20 7946 0960',
        isVerified: true
      },
      {
        email: 'david.wilson@propertymastersuk.com',
        firstName: 'David',
        lastName: 'Wilson',
        role: 'landlord',
        phone: '+44 20 7946 0961',
        isVerified: true
      },
      {
        email: 'emma.davis@propertymastersuk.com',
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'landlord',
        phone: '+44 20 7946 0962',
        isVerified: true
      },
      {
        email: 'michael.brown@gmail.com',
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'tenant',
        phone: '+44 20 7946 0963',
        isVerified: true
      },
      {
        email: 'lisa.taylor@gmail.com',
        firstName: 'Lisa',
        lastName: 'Taylor',
        role: 'tenant',
        phone: '+44 20 7946 0964',
        isVerified: true
      },
      {
        email: 'james.anderson@gmail.com',
        firstName: 'James',
        lastName: 'Anderson',
        role: 'buyer',
        phone: '+44 20 7946 0965',
        isVerified: true
      },
      {
        email: 'rachel.white@lawfirm.co.uk',
        firstName: 'Rachel',
        lastName: 'White',
        role: 'solicitor',
        phone: '+44 20 7946 0966',
        isVerified: true
      }
    ];

    // Insert users
    for (const user of users) {
      await dataSource.query(`
        INSERT INTO users (email, password, "firstName", "lastName", phone, role, "isVerified")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, hashedPassword, user.firstName, user.lastName, user.phone, user.role, user.isVerified]);
    }

    // Get user IDs for relationships
    const johnAgent = await dataSource.query('SELECT id FROM users WHERE email = $1', ['john.smith@propertymastersuk.com']);
    const sarahAgent = await dataSource.query('SELECT id FROM users WHERE email = $1', ['sarah.johnson@propertymastersuk.com']);
    const davidLandlord = await dataSource.query('SELECT id FROM users WHERE email = $1', ['david.wilson@propertymastersuk.com']);
    const emmaLandlord = await dataSource.query('SELECT id FROM users WHERE email = $1', ['emma.davis@propertymastersuk.com']);

    // Insert agent profiles
    const existingSarahAgent = await dataSource.query('SELECT id FROM agents WHERE "userId" = $1', [sarahAgent.length > 0 ? sarahAgent[0].id : null]);
    if (sarahAgent.length > 0 && existingSarahAgent.length === 0) {
      await dataSource.query(`
        INSERT INTO agents ("userId", "licenseNumber", "agencyName", specializations, "yearsExperience")
        VALUES ($1, $2, $3, $4, $5)
      `, [
        sarahAgent[0].id,
        'AG001234',
        'Prime Properties London',
        ['residential', 'commercial', 'luxury'],
        8
      ]);
    }

    const existingJohnAgent = await dataSource.query('SELECT id FROM agents WHERE "userId" = $1', [johnAgent.length > 0 ? johnAgent[0].id : null]);
    if (johnAgent.length > 0 && existingJohnAgent.length === 0) {
      await dataSource.query(`
        INSERT INTO agents ("userId", "licenseNumber", "agencyName", specializations, "yearsExperience")
        VALUES ($1, $2, $3, $4, $5)
      `, [
        johnAgent[0].id,
        'AG005678',
        'City Centre Estates',
        ['residential', 'student'],
        5
      ]);
    }

    // Insert landlord profiles
    const existingDavidLandlord = await dataSource.query('SELECT id FROM landlords WHERE "userId" = $1', [davidLandlord.length > 0 ? davidLandlord[0].id : null]);
    if (davidLandlord.length > 0 && existingDavidLandlord.length === 0) {
      await dataSource.query(`
        INSERT INTO landlords ("userId", "companyName", "businessAddress", "businessPhone", "businessEmail", "landlordType", "portfolioSize", "isAccredited", "accreditationScheme")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        davidLandlord[0].id,
        'Wilson Property Investments Ltd',
        '789 Business Park, London, E14 5AB',
        '+44 20 7946 0961',
        'david@wilsonproperties.co.uk',
        'company',
        15,
        true,
        'London Property Licensing Scheme'
      ]);
    }

    const existingEmmaLandlord = await dataSource.query('SELECT id FROM landlords WHERE "userId" = $1', [emmaLandlord.length > 0 ? emmaLandlord[0].id : null]);
    if (emmaLandlord.length > 0 && existingEmmaLandlord.length === 0) {
      await dataSource.query(`
        INSERT INTO landlords ("userId", "landlordType", "portfolioSize", "isAccredited")
        VALUES ($1, $2, $3, $4)
      `, [
        emmaLandlord[0].id,
        'individual',
        3,
        false
      ]);
    }

    console.log('✅ Comprehensive seed data inserted successfully');
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@propertymastersuk.com / password123');
    console.log('Agent (John): john.smith@propertymastersuk.com / password123');
    console.log('Agent (Sarah): sarah.johnson@propertymastersuk.com / password123');
    console.log('Landlord (David): david.wilson@propertymastersuk.com / password123');
    console.log('Landlord (Emma): emma.davis@propertymastersuk.com / password123');
    console.log('Tenant (Michael): michael.brown@gmail.com / password123');
    console.log('Tenant (Lisa): lisa.taylor@gmail.com / password123');
    console.log('Buyer (James): james.anderson@gmail.com / password123');
    console.log('Solicitor (Rachel): rachel.white@lawfirm.co.uk / password123');

  } catch (error) {
    console.error('❌ Error running comprehensive seed:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
};

runComprehensiveSeed().catch(console.error);