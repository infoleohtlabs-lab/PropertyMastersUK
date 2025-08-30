const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from frontend/.env.example
function loadEnvConfig() {
  const envPath = path.join(__dirname, 'frontend', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Environment file not found at:', envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/["']/g, '');
    }
  });

  return envVars;
}

// Initialize Supabase client with anon key
function initializeSupabase() {
  const envVars = loadEnvConfig();
  
  const supabaseUrl = envVars.VITE_SUPABASE_URL;
  const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Production test users to test
const productionTestUsers = [
  {
    email: 'admin.propertymastersuk@gmail.com',
    role: 'Admin'
  },
  {
    email: 'agent.propertymastersuk@gmail.com',
    role: 'Agent'
  },
  {
    email: 'landlord.propertymastersuk@gmail.com',
    role: 'Landlord'
  },
  {
    email: 'tenant.propertymastersuk@gmail.com',
    role: 'Tenant'
  },
  {
    email: 'buyer.propertymastersuk@gmail.com',
    role: 'Buyer'
  },
  {
    email: 'solicitor.propertymastersuk@gmail.com',
    role: 'Solicitor'
  }
];

// Test login for user
async function testUserLogin(supabase, email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        console.log(`⚠️  Email not confirmed for: ${email}`);
        return 'not_confirmed';
      }
      throw error;
    }
    
    // Sign out immediately
    await supabase.auth.signOut();
    
    console.log(`✅ Login successful for: ${email}`);
    return 'success';
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.message);
    return 'failed';
  }
}

// Main function
async function main() {
  console.log('🚀 Testing production user logins...');
  console.log('=' .repeat(60));
  
  const supabase = initializeSupabase();
  
  console.log('\n🔐 Testing user logins...');
  console.log('-'.repeat(40));
  
  let successCount = 0;
  let notConfirmedCount = 0;
  let failedCount = 0;
  
  for (const user of productionTestUsers) {
    console.log(`\nTesting ${user.role}: ${user.email}`);
    
    const result = await testUserLogin(supabase, user.email, 'PropertyTest2024!');
    
    switch (result) {
      case 'success':
        successCount++;
        break;
      case 'not_confirmed':
        notConfirmedCount++;
        break;
      case 'failed':
        failedCount++;
        break;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOGIN TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful logins: ${successCount}/${productionTestUsers.length}`);
  console.log(`⚠️  Email not confirmed: ${notConfirmedCount}/${productionTestUsers.length}`);
  console.log(`❌ Failed logins: ${failedCount}/${productionTestUsers.length}`);
  
  if (notConfirmedCount > 0) {
    console.log('\n📧 NEXT STEPS:');
    console.log('-'.repeat(40));
    console.log('1. Get your Supabase Service Role Key from:');
    console.log('   Project Settings > API > service_role key (secret)');
    console.log('2. Update frontend/.env.example:');
    console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key');
    console.log('3. Run: node confirm-production-users.js');
  } else if (successCount === productionTestUsers.length) {
    console.log('\n🎉 All production test users can login successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('-'.repeat(40));
    productionTestUsers.forEach(user => {
      console.log(`${user.role}: ${user.email}`);
    });
    console.log('Password: PropertyTest2024!');
    console.log('\n🌐 Test the application at: https://property-masters.vercel.app');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});