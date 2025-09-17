const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from frontend/.env.production
const envPath = path.join(__dirname, 'frontend', '.env.production');
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
  console.error('❌ Supabase configuration not found in frontend/.env.production');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Production users matching the login form
const productionUsers = [
  {
    email: 'admin.propertymastersuk@gmail.com',
    password: 'PropertyTest2024!',
    role: 'admin',
    metadata: {
      role: 'admin',
      first_name: 'Admin',
      last_name: 'PropertyMasters',
      phone: '+44 20 7946 0958'
    }
  },
  {
    email: 'agent.propertymastersuk@gmail.com',
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
    email: 'landlord.propertymastersuk@gmail.com',
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
    email: 'tenant.propertymastersuk@gmail.com',
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
    email: 'buyer.propertymastersuk@gmail.com',
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
    email: 'solicitor.propertymastersuk@gmail.com',
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

// Function to test login for each user
async function testUserLogins() {
  console.log('\n🔐 Testing user logins...');
  
  const loginResults = [];
  
  for (const user of productionUsers) {
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

// Main function
async function main() {
  console.log('🚀 Creating PropertyMasters UK Gmail users...');
  console.log('=' .repeat(60));
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  console.log('\n👥 Creating users...');
  console.log('-'.repeat(40));
  
  const userResults = [];
  let successfulCreations = 0;
  
  for (const user of productionUsers) {
    const result = await createUser(user);
    userResults.push({ ...result, email: user.email });
    
    if (result.success) {
      successfulCreations++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 USER CREATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Created/Verified: ${successfulCreations}/${productionUsers.length} users`);
  
  // Test logins
  const loginResults = await testUserLogins();
  const successfulLogins = loginResults.filter(r => r.success).length;
  
  console.log('\n📊 LOGIN TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful logins: ${successfulLogins}/${productionUsers.length}`);
  
  if (successfulLogins === productionUsers.length) {
    console.log('\n🎉 All users are ready for production!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('-'.repeat(40));
    productionUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email}`);
    });
    console.log('Password: PropertyTest2024!');
    console.log('\n🌐 Test at: https://property-masters.vercel.app');
  } else {
    console.log('\n⚠️  Some users may need email confirmation.');
    console.log('Check the Supabase dashboard for user status.');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});