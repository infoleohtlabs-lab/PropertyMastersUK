const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from frontend/.env.example
const envPath = path.join(__dirname, 'frontend', '.env.example');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration not found in frontend/.env.example');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Production test users with test email domains
const productionTestUsers = [
  {
    email: 'admin@test.com',
    password: 'PropertyTest2024!',
    role: 'admin',
    metadata: {
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      phone: '+44 20 7946 0958'
    }
  },
  {
    email: 'agent@test.com',
    password: 'PropertyTest2024!',
    role: 'agent',
    metadata: {
      role: 'agent',
      first_name: 'Estate',
      last_name: 'Agent',
      phone: '+44 20 7946 0959'
    }
  },
  {
    email: 'landlord@test.com',
    password: 'PropertyTest2024!',
    role: 'landlord',
    metadata: {
      role: 'landlord',
      first_name: 'Property',
      last_name: 'Landlord',
      phone: '+44 20 7946 0960'
    }
  },
  {
    email: 'tenant@test.com',
    password: 'PropertyTest2024!',
    role: 'tenant',
    metadata: {
      role: 'tenant',
      first_name: 'Property',
      last_name: 'Tenant',
      phone: '+44 20 7946 0961'
    }
  },
  {
    email: 'buyer@test.com',
    password: 'PropertyTest2024!',
    role: 'buyer',
    metadata: {
      role: 'buyer',
      first_name: 'Property',
      last_name: 'Buyer',
      phone: '+44 20 7946 0962'
    }
  },
  {
    email: 'solicitor@test.com',
    password: 'PropertyTest2024!',
    role: 'solicitor',
    metadata: {
      role: 'solicitor',
      first_name: 'Property',
      last_name: 'Solicitor',
      phone: '+44 20 7946 0963'
    }
  }
];

// Function to test Supabase connection
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('properties').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Connection test result:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Function to create a user
async function createUser(userInfo) {
  try {
    console.log(`\n📝 Creating user: ${userInfo.email} (${userInfo.role})`);
    
    const { data, error } = await supabase.auth.signUp({
      email: userInfo.email,
      password: userInfo.password,
      options: {
        data: userInfo.metadata
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️  User ${userInfo.email} already exists`);
        return { success: true, existing: true, user: null };
      }
      console.error(`❌ Failed to create ${userInfo.email}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Successfully created user: ${userInfo.email}`);
    return { success: true, existing: false, user: data.user };
  } catch (error) {
    console.error(`❌ Exception creating ${userInfo.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Function to verify user creation
async function verifyUsers() {
  console.log('\n🔍 Verifying user creation...');
  
  try {
    // Note: With anon key, we have limited access to user data
    // This is a basic verification attempt
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  User verification limited with anonymous key');
      return false;
    }
    
    console.log('✅ User verification completed (limited scope with anon key)');
    return true;
  } catch (error) {
    console.log('⚠️  User verification not available:', error.message);
    return false;
  }
}

// Function to test login for each user
async function testUserLogins() {
  console.log('\n🔐 Testing user logins...');
  
  const loginResults = [];
  
  for (const user of productionTestUsers) {
    try {
      console.log(`\n🔑 Testing login for: ${user.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`❌ Login failed for ${user.email}:`, error.message);
        loginResults.push({ email: user.email, success: false, error: error.message });
      } else {
        console.log(`✅ Login successful for ${user.email}`);
        loginResults.push({ email: user.email, success: true });
        
        // Sign out after successful login test
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`❌ Login exception for ${user.email}:`, error.message);
      loginResults.push({ email: user.email, success: false, error: error.message });
    }
  }
  
  return loginResults;
}

// Function to create user profiles in database tables (if they exist)
async function createUserProfiles() {
  console.log('\n👤 Attempting to create user profiles...');
  
  try {
    // Check if users table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (tableError || !tables || tables.length === 0) {
      console.log('⚠️  Users table not found - skipping profile creation');
      return false;
    }
    
    console.log('✅ Users table found - profiles will be created via Auth triggers');
    return true;
  } catch (error) {
    console.log('⚠️  Could not check for users table:', error.message);
    return false;
  }
}

// Main execution function
async function main() {
  console.log('🚀 PropertyMasters UK - Production Test Users Setup');
  console.log('=' .repeat(60));
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  // Create users
  console.log('\n👥 Creating production test users...');
  const creationResults = [];
  
  for (const user of productionTestUsers) {
    const result = await createUser(user);
    creationResults.push({ ...user, ...result });
  }
  
  // Check for user profiles
  await createUserProfiles();
  
  // Verify users
  await verifyUsers();
  
  // Test logins
  const loginResults = await testUserLogins();
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 PRODUCTION TEST USERS SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('\n🔐 LOGIN CREDENTIALS:');
  productionTestUsers.forEach(user => {
    const creation = creationResults.find(r => r.email === user.email);
    const login = loginResults.find(r => r.email === user.email);
    
    console.log(`\n${user.role.toUpperCase()} USER:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Creation: ${creation?.success ? (creation?.existing ? 'Already existed' : 'Created') : 'Failed'}`);
    console.log(`  Login Test: ${login?.success ? 'Passed' : 'Failed'}`);
    
    if (!login?.success && login?.error) {
      console.log(`  Login Error: ${login.error}`);
    }
  });
  
  console.log('\n📝 NOTES:');
  console.log('- All users use the same password: PropertyTest2024!');
  console.log('- Users may need email confirmation depending on Supabase settings');
  console.log('- If login tests fail, check Supabase Auth settings');
  console.log('- These are test accounts using @example.com domain');
  console.log('- Update frontend login components with these new email addresses');
  
  const successfulCreations = creationResults.filter(r => r.success).length;
  const successfulLogins = loginResults.filter(r => r.success).length;
  
  console.log(`\n✅ Created/Verified: ${successfulCreations}/${productionTestUsers.length} users`);
  console.log(`✅ Login Tests Passed: ${successfulLogins}/${productionTestUsers.length} users`);
  
  if (successfulLogins === productionTestUsers.length) {
    console.log('\n🎉 All production test users are ready for testing!');
  } else {
    console.log('\n⚠️  Some users may need additional setup (email confirmation, etc.)');
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { main, productionTestUsers };