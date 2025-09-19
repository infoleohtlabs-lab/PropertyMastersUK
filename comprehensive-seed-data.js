const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Demo users with different roles
const demoUsers = [
  {
    email: 'superadmin@propertymastersuk.com',
    password: 'SuperAdmin123!',
    role: 'SUPER_ADMIN',
    metadata: {
      full_name: 'Super Admin',
      role: 'SUPER_ADMIN',
      phone: '+44 20 7946 0001'
    }
  },
  {
    email: 'admin@propertymastersuk.com',
    password: 'Admin123!',
    role: 'ADMIN',
    metadata: {
      full_name: 'System Admin',
      role: 'ADMIN',
      phone: '+44 20 7946 0002'
    }
  },
  {
    email: 'manager@propertymastersuk.com',
    password: 'Manager123!',
    role: 'PROPERTY_MANAGER',
    metadata: {
      full_name: 'Property Manager',
      role: 'PROPERTY_MANAGER',
      phone: '+44 20 7946 0003'
    }
  },
  {
    email: 'agent1@propertymastersuk.com',
    password: 'Agent123!',
    role: 'AGENT',
    metadata: {
      full_name: 'Sarah Johnson',
      role: 'AGENT',
      phone: '+44 20 7946 0004'
    }
  },
  {
    email: 'agent2@propertymastersuk.com',
    password: 'Agent123!',
    role: 'AGENT',
    metadata: {
      full_name: 'Michael Brown',
      role: 'AGENT',
      phone: '+44 20 7946 0005'
    }
  },
  {
    email: 'landlord1@demo.com',
    password: 'Landlord123!',
    role: 'LANDLORD',
    metadata: {
      full_name: 'James Wilson',
      role: 'LANDLORD',
      phone: '+44 20 7946 0006'
    }
  },
  {
    email: 'landlord2@demo.com',
    password: 'Landlord123!',
    role: 'LANDLORD',
    metadata: {
      full_name: 'Emma Davis',
      role: 'LANDLORD',
      phone: '+44 20 7946 0007'
    }
  },
  {
    email: 'tenant1@demo.com',
    password: 'Tenant123!',
    role: 'TENANT',
    metadata: {
      full_name: 'Robert Smith',
      role: 'TENANT',
      phone: '+44 20 7946 0008'
    }
  },
  {
    email: 'tenant2@demo.com',
    password: 'Tenant123!',
    role: 'TENANT',
    metadata: {
      full_name: 'Lisa Anderson',
      role: 'TENANT',
      phone: '+44 20 7946 0009'
    }
  },
  {
    email: 'buyer1@demo.com',
    password: 'Buyer123!',
    role: 'BUYER',
    metadata: {
      full_name: 'David Taylor',
      role: 'BUYER',
      phone: '+44 20 7946 0010'
    }
  },
  {
    email: 'buyer2@demo.com',
    password: 'Buyer123!',
    role: 'BUYER',
    metadata: {
      full_name: 'Mary Jones',
      role: 'BUYER',
      phone: '+44 20 7946 0011'
    }
  },
  {
    email: 'seller1@demo.com',
    password: 'Seller123!',
    role: 'SELLER',
    metadata: {
      full_name: 'Thomas White',
      role: 'SELLER',
      phone: '+44 20 7946 0012'
    }
  },
  {
    email: 'solicitor1@demo.com',
    password: 'Solicitor123!',
    role: 'SOLICITOR',
    metadata: {
      full_name: 'Jennifer Clark',
      role: 'SOLICITOR',
      phone: '+44 20 7946 0013'
    }
  },
  {
    email: 'contractor1@demo.com',
    password: 'Contractor123!',
    role: 'CONTRACTOR',
    metadata: {
      full_name: 'Mark Thompson',
      role: 'CONTRACTOR',
      phone: '+44 20 7946 0014'
    }
  }
];

// Sample role-specific data
const sampleAgents = [
  {
    email: 'agent1@propertymastersuk.com',
    license_number: 'AG001234',
    specialization: 'Residential Sales',
    commission_rate: 2.5,
    bio: 'Experienced residential sales agent with 8 years in London property market.',
    languages: ['English', 'French']
  },
  {
    email: 'agent2@propertymastersuk.com',
    license_number: 'AG001235',
    specialization: 'Commercial Lettings',
    commission_rate: 3.0,
    bio: 'Commercial property specialist focusing on office and retail spaces.',
    languages: ['English', 'Spanish']
  }
];

const sampleLandlords = [
  {
    email: 'landlord1@demo.com',
    company_name: 'Wilson Property Investments',
    portfolio_size: 12,
    preferred_contact_method: 'email',
    emergency_contact: '+44 20 7946 1111'
  },
  {
    email: 'landlord2@demo.com',
    company_name: 'Davis Estates Ltd',
    portfolio_size: 8,
    preferred_contact_method: 'phone',
    emergency_contact: '+44 20 7946 2222'
  }
];

const sampleTenants = [
  {
    email: 'tenant1@demo.com',
    employment_status: 'employed',
    annual_income: 45000,
    preferred_location: 'South London',
    max_budget: 1800
  },
  {
    email: 'tenant2@demo.com',
    employment_status: 'employed',
    annual_income: 38000,
    preferred_location: 'North London',
    max_budget: 1500
  }
];

const sampleBuyers = [
  {
    email: 'buyer1@demo.com',
    buyer_type: 'first_time',
    max_budget: 450000,
    preferred_areas: ['Clapham', 'Brixton', 'Peckham'],
    financing_approved: true
  },
  {
    email: 'buyer2@demo.com',
    buyer_type: 'investor',
    max_budget: 800000,
    preferred_areas: ['Canary Wharf', 'Greenwich', 'Docklands'],
    financing_approved: true
  }
];

const sampleContractors = [
  {
    email: 'contractor1@demo.com',
    company_name: 'Thompson Building Services',
    trade_specialization: 'General Building',
    license_number: 'CB001234',
    insurance_valid_until: '2025-12-31',
    hourly_rate: 45.00
  }
];

async function createUsers() {
  console.log('🚀 Creating demo users...');
  const createdUsers = [];
  
  for (const user of demoUsers) {
    try {
      console.log(`\n👤 Creating user: ${user.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.metadata
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
          // Try to get existing user info
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });
          if (signInData.user) {
            createdUsers.push({ ...user, user_id: signInData.user.id });
            await supabase.auth.signOut();
          }
        } else {
          console.log(`   ❌ Failed: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Created successfully`);
        if (data.user) {
          createdUsers.push({ ...user, user_id: data.user.id });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.log(`   💥 Error: ${err.message}`);
    }
  }
  
  return createdUsers;
}

async function createRoleSpecificData(users) {
  console.log('\n🏢 Creating role-specific data...');
  
  // Create agents data
  for (const agentData of sampleAgents) {
    const user = users.find(u => u.email === agentData.email);
    if (user && user.user_id) {
      try {
        const { error } = await supabase.from('agents').insert({
          user_id: user.user_id,
          license_number: agentData.license_number,
          specialization: agentData.specialization,
          commission_rate: agentData.commission_rate,
          bio: agentData.bio,
          languages: agentData.languages
        });
        
        if (error) {
          console.log(`   ❌ Error creating agent for ${agentData.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created agent record for ${agentData.email}`);
        }
      } catch (err) {
        console.log(`   💥 Error creating agent: ${err.message}`);
      }
    }
  }
  
  // Create landlords data
  for (const landlordData of sampleLandlords) {
    const user = users.find(u => u.email === landlordData.email);
    if (user && user.user_id) {
      try {
        const { error } = await supabase.from('landlords').insert({
          user_id: user.user_id,
          company_name: landlordData.company_name,
          portfolio_size: landlordData.portfolio_size,
          preferred_contact_method: landlordData.preferred_contact_method,
          emergency_contact: landlordData.emergency_contact
        });
        
        if (error) {
          console.log(`   ❌ Error creating landlord for ${landlordData.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created landlord record for ${landlordData.email}`);
        }
      } catch (err) {
        console.log(`   💥 Error creating landlord: ${err.message}`);
      }
    }
  }
  
  // Create tenants data
  for (const tenantData of sampleTenants) {
    const user = users.find(u => u.email === tenantData.email);
    if (user && user.user_id) {
      try {
        const { error } = await supabase.from('tenants').insert({
          user_id: user.user_id,
          employment_status: tenantData.employment_status,
          annual_income: tenantData.annual_income,
          preferred_location: tenantData.preferred_location,
          max_budget: tenantData.max_budget
        });
        
        if (error) {
          console.log(`   ❌ Error creating tenant for ${tenantData.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created tenant record for ${tenantData.email}`);
        }
      } catch (err) {
        console.log(`   💥 Error creating tenant: ${err.message}`);
      }
    }
  }
  
  // Create buyers data
  for (const buyerData of sampleBuyers) {
    const user = users.find(u => u.email === buyerData.email);
    if (user && user.user_id) {
      try {
        const { error } = await supabase.from('buyers').insert({
          user_id: user.user_id,
          buyer_type: buyerData.buyer_type,
          max_budget: buyerData.max_budget,
          preferred_areas: buyerData.preferred_areas,
          financing_approved: buyerData.financing_approved
        });
        
        if (error) {
          console.log(`   ❌ Error creating buyer for ${buyerData.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created buyer record for ${buyerData.email}`);
        }
      } catch (err) {
        console.log(`   💥 Error creating buyer: ${err.message}`);
      }
    }
  }
  
  // Create contractors data
  for (const contractorData of sampleContractors) {
    const user = users.find(u => u.email === contractorData.email);
    if (user && user.user_id) {
      try {
        const { error } = await supabase.from('contractors').insert({
          user_id: user.user_id,
          company_name: contractorData.company_name,
          trade_specialization: contractorData.trade_specialization,
          license_number: contractorData.license_number,
          insurance_valid_until: contractorData.insurance_valid_until,
          hourly_rate: contractorData.hourly_rate
        });
        
        if (error) {
          console.log(`   ❌ Error creating contractor for ${contractorData.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created contractor record for ${contractorData.email}`);
        }
      } catch (err) {
        console.log(`   💥 Error creating contractor: ${err.message}`);
      }
    }
  }
}

async function verifySeeding() {
  console.log('\n🔍 Verifying seed data...');
  
  const tables = [
    'properties', 'property_images', 'property_features',
    'inquiries', 'viewings', 'agents', 'landlords', 
    'tenants', 'buyers', 'contractors'
  ];
  
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count} records`);
        totalRecords += count || 0;
      }
    } catch (err) {
      console.log(`   💥 ${table}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Total records across all tables: ${totalRecords}`);
}

async function main() {
  try {
    console.log('🏠 PropertyMasters UK - Comprehensive Seed Data Script');
    console.log('=' .repeat(60));
    
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Create users
    const users = await createUsers();
    console.log(`\n📊 Created/found ${users.length} users`);
    
    // Create role-specific data
    await createRoleSpecificData(users);
    
    // Verify seeding
    await verifySeeding();
    
    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('\n📋 Demo User Credentials:');
    console.log('=' .repeat(40));
    demoUsers.forEach(user => {
      console.log(`${user.metadata.full_name} (${user.role}):`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });
    
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, createUsers, createRoleSpecificData, verifySeeding };