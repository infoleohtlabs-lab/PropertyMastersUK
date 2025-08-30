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

// PropertyMasters test users with propertymasters.com domain
const propertyMastersTestUsers = [
  {
    email: 'admin@propertymasters.com',
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
    email: 'agent@propertymasters.com',
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
    email: 'landlord@propertymasters.com',
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
    email: 'tenant@propertymasters.com',
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
    email: 'buyer@propertymasters.com',
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
    email: 'solicitor@propertymasters.com',
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
  
  for (const user of propertyMastersTestUsers) {
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

// Function to display summary
function displaySummary(creationResults, loginResults) {
  console.log('\n📊 Summary Report');
  console.log('==================');
  
  console.log('\n👥 User Creation Results:');
  let createdCount = 0;
  let existingCount = 0;
  let failedCount = 0;
  
  creationResults.forEach(result => {
    if (result.success) {
      if (result.existing) {
        console.log(`   ${result.email}: ⚠️  Already exists`);
        existingCount++;
      } else {
        console.log(`   ${result.email}: ✅ Created`);
        createdCount++;
      }
    } else {
      console.log(`   ${result.email}: ❌ Failed - ${result.error}`);
      failedCount++;
    }
  });
  
  console.log(`\n📈 Creation Stats: ${createdCount} created, ${existingCount} existing, ${failedCount} failed`);
  
  if (loginResults && loginResults.length > 0) {
    console.log('\n🔐 Login Test Results:');
    let loginSuccessCount = 0;
    
    loginResults.forEach(result => {
      if (result.success) {
        console.log(`   ${result.email}: ✅ Login successful`);
        loginSuccessCount++;
      } else {
        console.log(`   ${result.email}: ❌ Login failed - ${result.error}`);
      }
    });
    
    console.log(`\n🎯 Login Stats: ${loginSuccessCount}/${loginResults.length} successful logins`);
  }
  
  console.log('\n🎉 PropertyMasters test users setup complete!');
  console.log('\n📧 Test Account Credentials:');
  propertyMastersTestUsers.forEach(user => {
    console.log(`   ${user.role.padEnd(10)}: ${user.email} / ${user.password}`);
  });
}

// Main execution function
async function main() {
  console.log('🚀 PropertyMasters UK - Test User Creation Script');
  console.log('================================================');
  console.log('Creating test users with @propertymasters.com domain\n');
  
  // Test connection first
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  // Create all users
  console.log('\n👥 Creating PropertyMasters test users...');
  const creationResults = [];
  
  for (const user of propertyMastersTestUsers) {
    const result = await createUser(user);
    creationResults.push({ email: user.email, ...result });
    
    // Small delay between user creations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Verify users
  await verifyUsers();
  
  // Test logins
  const loginResults = await testUserLogins();
  
  // Display summary
  displaySummary(creationResults, loginResults);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error.message);
  process.exit(1);
});