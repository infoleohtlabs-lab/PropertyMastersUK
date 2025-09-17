const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from frontend/.env
function loadEnvFile() {
  const envPath = path.join(__dirname, 'frontend', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

const env = loadEnvFile();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Production test users with working email domains
const productionTestUsers = [
  {
    email: 'admin.propertymaster@outlook.com',
    password: 'AdminPass123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  {
    email: 'agent.propertymaster@hotmail.com',
    password: 'AgentPass123!',
    role: 'agent',
    firstName: 'Agent',
    lastName: 'Smith'
  },
  {
    email: 'landlord.propertymaster@outlook.com',
    password: 'LandlordPass123!',
    role: 'landlord',
    firstName: 'John',
    lastName: 'Landlord'
  },
  {
    email: 'tenant.propertymaster@hotmail.com',
    password: 'TenantPass123!',
    role: 'tenant',
    firstName: 'Jane',
    lastName: 'Tenant'
  },
  {
    email: 'buyer.propertymaster@himanwdawxstxwphimhw.supabase.co',
    password: 'BuyerPass123!',
    role: 'buyer',
    firstName: 'Mike',
    lastName: 'Buyer'
  },
  {
    email: 'solicitor.propertymaster@himanwdawxstxwphimhw.supabase.co',
    password: 'SolicitorPass123!',
    role: 'solicitor',
    firstName: 'Sarah',
    lastName: 'Solicitor'
  }
];

// Function to wait for specified milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to test connection
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test exception:', error.message);
    return false;
  }
}

// Function to create a user with retry logic
async function createUserWithRetry(userInfo, retryCount = 0) {
  const maxRetries = 3;
  
  try {
    console.log(`\n📝 Creating user: ${userInfo.email} (${userInfo.role})`);
    
    const { data, error } = await supabase.auth.signUp({
      email: userInfo.email,
      password: userInfo.password,
      options: {
        data: {
          role: userInfo.role,
          first_name: userInfo.firstName,
          last_name: userInfo.lastName
        },
        emailRedirectTo: undefined
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️  User ${userInfo.email} already exists`);
        return { success: true, existing: true, user: null, email: userInfo.email };
      }
      
      if (error.message.includes('For security purposes') && retryCount < maxRetries) {
        const waitTime = 40000; // 40 seconds
        console.log(`⏳ Rate limited. Waiting ${waitTime/1000} seconds before retry ${retryCount + 1}/${maxRetries}...`);
        await sleep(waitTime);
        return createUserWithRetry(userInfo, retryCount + 1);
      }
      
      console.error(`❌ Failed to create ${userInfo.email}:`, error.message);
      return { success: false, error: error.message, email: userInfo.email };
    }

    if (data.session) {
      console.log(`🔓 User ${userInfo.email} is immediately authenticated`);
    } else {
      console.log(`📧 User ${userInfo.email} needs email confirmation`);
    }
    
    return { 
      success: true, 
      existing: false, 
      user: data.user, 
      needsConfirmation: !data.session,
      email: userInfo.email,
      role: userInfo.role,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName
    };
  } catch (error) {
    console.error(`❌ Exception creating ${userInfo.email}:`, error.message);
    return { success: false, error: error.message, email: userInfo.email };
  }
}

// Function to create user profiles
async function createUserProfiles(userResults) {
  console.log('\n👤 Creating user profiles in users table...');
  
  const profileResults = [];
  
  for (const result of userResults) {
    if (!result.success || result.existing) {
      console.log(`  Skipping profile creation for ${result.email} (${result.existing ? 'existed' : 'failed'})`);
      continue;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: result.user.id,
          email: result.user.email,
          role: result.role,
          first_name: result.firstName,
          last_name: result.lastName,
          phone: `+44 20 7946 ${Math.floor(Math.random() * 9000) + 1000}`,
          is_active: true
        })
        .select();
      
      if (error) {
        console.error(`  ❌ Failed to create profile for ${result.email}:`, error.message);
        profileResults.push({ email: result.email, success: false, error: error.message });
      } else {
        console.log(`  ✅ Created profile for ${result.email}`);
        profileResults.push({ email: result.email, success: true, profile: data[0] });
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error creating profile for ${result.email}:`, error.message);
      profileResults.push({ email: result.email, success: false, error: error.message });
    }
    
    // Small delay between profile creations
    await sleep(1000);
  }
  
  return profileResults;
}

// Function to test logins
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
    
    // Small delay between login tests
    await sleep(2000);
  }
  
  return loginResults;
}

// Main execution function
async function main() {
  console.log('🚀 PropertyMasters UK - Production Test Users Setup (Rate Limited)');
  console.log('=' .repeat(70));
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  // Create users with rate limiting
  console.log('\n👥 Creating production test users with rate limiting...');
  const creationResults = [];
  
  for (let i = 0; i < productionTestUsers.length; i++) {
    const user = productionTestUsers[i];
    const result = await createUserWithRetry(user);
    creationResults.push(result);
    
    // Wait between user creations to avoid rate limiting
    if (i < productionTestUsers.length - 1) {
      console.log('⏳ Waiting 45 seconds before next user creation...');
      await sleep(45000);
    }
  }
  
  // Create user profiles
  const profileResults = await createUserProfiles(creationResults);
  
  // Test logins
  const loginResults = await testUserLogins();
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 PRODUCTION TEST USERS SUMMARY');
  console.log('=' .repeat(70));
  
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
  console.log('- Each user has a unique password for security');
  console.log('- Using modified email addresses to avoid domain restrictions');
  console.log('- Script includes rate limiting to handle Supabase restrictions');
  console.log('- Users may need email confirmation before login');
  console.log('- Use these credentials for testing the application');
  
  const successfulCreations = creationResults.filter(r => r.success).length;
  const profileSuccessful = profileResults.filter(r => r.success).length;
  const successfulLogins = loginResults.filter(r => r.success).length;
  
  console.log(`\n✅ Created/Verified: ${successfulCreations}/${productionTestUsers.length} users`);
  console.log(`✅ Profiles created: ${profileSuccessful}/${creationResults.filter(r => r.success && !r.existing).length}`);
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