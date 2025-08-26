import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../users/entities/user.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { Landlord, LandlordType, PortfolioSize } from '../../landlords/entities/landlord.entity';
import { Tenant, EmploymentStatus } from '../../tenants/entities/tenant.entity';
import { Buyer, BuyerType } from '../../buyers/entities/buyer.entity';
import { Property, PropertyType, PropertyStatus } from '../../properties/entities/property.entity';
import { Booking, BookingType, BookingStatus, BookingPriority } from '../../booking/entities/booking.entity';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await this.clearData();
    
    // Seed data in order
    const users = await this.seedUsers();
    const agents = await this.seedAgents(users);
    const landlords = await this.seedLandlords(users);
    const properties = await this.seedProperties(landlords, agents);
    const tenants = await this.seedTenants(users, properties, landlords);
    const buyers = await this.seedBuyers(users);
    const bookings = await this.seedBookings(properties, users);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`Created: ${users.length} users, ${agents.length} agents, ${landlords.length} landlords, ${tenants.length} tenants, ${buyers.length} buyers, ${properties.length} properties, ${bookings.length} bookings`);
  }

  private async clearData() {
    console.log('🧹 Clearing existing data...');
    
    // Clear in reverse order of dependencies
    await this.dataSource.getRepository(Booking).clear();
    await this.dataSource.getRepository(Property).clear();
    await this.dataSource.getRepository(Buyer).clear();
    await this.dataSource.getRepository(Tenant).clear();
    await this.dataSource.getRepository(Landlord).clear();
    await this.dataSource.getRepository(Agent).clear();
    await this.dataSource.getRepository(User).clear();
  }

  private async seedUsers() {
    console.log('👥 Seeding users...');
    const userRepository = this.dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        email: 'admin@propertymastersuk.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4567'
      },
      {
        email: 'john.agent@propertymastersuk.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Agent',
        role: UserRole.AGENT,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4568'
      },
      {
        email: 'sarah.landlord@gmail.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: UserRole.LANDLORD,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4569'
      },
      {
        email: 'mike.tenant@gmail.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        role: UserRole.TENANT,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4570'
      },
      {
        email: 'emma.buyer@gmail.com',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Brown',
        role: UserRole.BUYER,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4571'
      },
      {
        email: 'solicitor@propertymastersuk.com',
        password: hashedPassword,
        firstName: 'Legal',
        lastName: 'Solicitor',
        role: UserRole.SOLICITOR,
        isActive: true,
        isVerified: true,
        phone: '+44 20 7123 4572'
      }
    ];

    return await userRepository.save(users);
  }

  private async seedAgents(users: User[]) {
    console.log('🏢 Seeding agents...');
    const agentRepository = this.dataSource.getRepository(Agent);
    const agentUser = users.find(u => u.role === 'agent');

    const agents = [
      {
        userId: agentUser.id,
        companyName: 'PropertyMasters UK',
        licenseNumber: 'PM-UK-001',
        address: '123 High Street',
        postcode: 'SW1A 1AA',
        city: 'London',
        county: 'Greater London',
        website: 'https://propertymastersuk.com',
        description: 'Leading property experts in London with over 10 years of experience.',
        isActive: true,
        isVerified: true
      }
    ];

    return await agentRepository.save(agents);
  }

  private async seedLandlords(users: User[]) {
    console.log('🏠 Seeding landlords...');
    const landlordRepository = this.dataSource.getRepository(Landlord);
    const landlordUser = users.find(u => u.role === 'landlord');

    const landlords = [
      {
        userId: landlordUser.id,
        type: LandlordType.INDIVIDUAL,
        portfolioSize: PortfolioSize.SMALL,
        businessAddress: '456 Oak Avenue',
        businessPostcode: 'SW2 2BB',
        businessCity: 'London',
        businessCounty: 'Greater London'
      }
    ];

    return await landlordRepository.save(landlords);
  }

  private async seedTenants(users: User[], properties: Property[], landlords: Landlord[]) {
    console.log('🏘️ Seeding tenants...');
    const tenantRepository = this.dataSource.getRepository(Tenant);
    const tenantUser = users.find(u => u.role === 'tenant');
    const property = properties[0]; // First property
    const landlord = landlords[0]; // First landlord

    const tenants = [
      {
        userId: tenantUser.id,
        propertyId: property.id,
        landlordId: landlord.userId,
        tenancyStartDate: new Date('2024-01-01'),
        tenancyEndDate: new Date('2024-12-31'),
        monthlyRent: 2500,
        deposit: 5000,
        paymentDueDate: 1, // 1st of each month
        annualIncome: 42000,
        creditScore: 750,
        employerName: 'Tech Solutions Ltd',
        jobTitle: 'Software Developer'
      }
    ];

    return await tenantRepository.save(tenants);
  }

  private async seedBuyers(users: User[]) {
    console.log('🛒 Seeding buyers...');
    const buyerRepository = this.dataSource.getRepository(Buyer);
    const buyerUser = users.find(u => u.role === 'buyer');

    const buyers = [
      {
        userId: buyerUser.id,
        buyerType: BuyerType.FIRST_TIME,
        maxBudget: 500000,
        minBudget: 300000,
        preferredAreas: ['London', 'Surrey', 'Kent'],
        mortgagePreApproval: true
      }
    ];

    return await buyerRepository.save(buyers);
  }

  private async seedProperties(landlords: Landlord[], agents: Agent[]) {
    console.log('🏡 Seeding properties...');
    const propertyRepository = this.dataSource.getRepository(Property);
    const landlord = landlords[0];
    const agent = agents[0];

    const properties = [
      {
        title: 'Modern 2-Bedroom Apartment in Central London',
        description: 'Beautiful modern apartment with stunning city views, fully furnished with high-end appliances.',
        type: PropertyType.FLAT,
        price: 2500,
        bedrooms: 2,
        bathrooms: 2,
        addressLine1: '10 Canary Wharf',
        postcode: 'E14 5AB',
        city: 'London',
        county: 'Greater London',
        latitude: 51.5074,
        longitude: -0.1278,
        agentId: agent.userId,
        status: PropertyStatus.AVAILABLE,
        isActive: true,
        isFeatured: true
      },
      {
        title: 'Charming Victorian House in Richmond',
        description: 'Beautifully restored Victorian house with original features and modern amenities.',
        type: PropertyType.HOUSE,
        price: 750000,
        bedrooms: 3,
        bathrooms: 2,
        addressLine1: '25 Richmond Hill',
        postcode: 'TW10 6QX',
        city: 'Richmond',
        county: 'Greater London',
        latitude: 51.4613,
        longitude: -0.3037,
        agentId: agent.userId,
        status: PropertyStatus.AVAILABLE,
        isActive: true,
        isFeatured: false
      },
      {
        title: 'Luxury Studio in Kensington',
        description: 'Premium studio apartment in prestigious Kensington location with 24/7 concierge.',
        type: PropertyType.FLAT,
        price: 1800,
        bedrooms: 0,
        bathrooms: 1,
        addressLine1: '88 Kensington High Street',
        postcode: 'W8 4SG',
        city: 'London',
        county: 'Greater London',
        latitude: 51.5014,
        longitude: -0.1943,
        agentId: agent.userId,
        status: PropertyStatus.AVAILABLE,
        isActive: true,
        isFeatured: true
      }
    ];

    return await propertyRepository.save(properties);
  }

  private async seedBookings(properties: Property[], users: User[]) {
    console.log('📅 Seeding bookings...');
    const bookingRepository = this.dataSource.getRepository(Booking);
    const clientUser = users.find(u => u.role === 'tenant');
    const agentUser = users.find(u => u.role === 'agent');
    const property = properties[0];

    const bookings = [
      {
        type: BookingType.VIEWING,
        status: BookingStatus.CONFIRMED,
        priority: BookingPriority.MEDIUM,
        scheduledDate: new Date('2024-01-15'),
        scheduledTime: '14:00',
        duration: 60,
        propertyId: property.id,
        userId: clientUser.id,
        clientId: clientUser.id,
        agentId: agentUser.id
      },
      {
        type: BookingType.VALUATION,
        status: BookingStatus.PENDING,
        priority: BookingPriority.HIGH,
        scheduledDate: new Date('2024-01-20'),
        scheduledTime: '10:00',
        duration: 90,
        propertyId: properties[1].id,
        userId: users.find(u => u.role === 'landlord').id,
        clientId: users.find(u => u.role === 'landlord').id,
        agentId: agentUser.id
      }
    ];

    return await bookingRepository.save(bookings);
  }
}