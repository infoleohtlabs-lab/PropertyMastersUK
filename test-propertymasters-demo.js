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

// PropertyMasters demo accounts (matching Login.tsx)
const demoAccounts = [
  {
    role: 'admin',
    email: 'admin@propertymasters.com',
    password: 'PropertyTest2024!'
  },
  {
    role: 'agent',
    email: 'agent@propertymasters.com',
    password: 'PropertyTest2024!'
  },
  {
    role: 'landlord',
    email: 'landlord@propertymasters.com',
    password: 'PropertyTest2024!'
  },
  {
    role: 'tenant',
    email: 'tenant@propertymasters.com',
    password: 'PropertyTest2024!'
  },
  {
    role: 'buyer',
    email: 'buyer@propertymasters.com',
    password: 'PropertyTest2024!'
  },
  {
    role: 'solicitor',
    email: 'solicitor@propertymasters.com',
    password: 'PropertyTest2024!'
  }
];

// Function to test demo login for a specific role
async function testDemoLogin(account) {
  try {
    console.log(`\n🔑 Testing demo login for: ${account.role} (${account.email})`);
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password
    });

    if (error) {
      console.log(`❌ Demo login failed for ${account.role}:`, error.message);
      return {
        role: account.role,
        email: account.email,
        success: false,
        error: error.message
      };
    }

    console.log(`✅ Demo login successful for ${account.role}`);
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Role: ${data.user?.user_metadata?.role || 'Not set'}`);
    
    // Test session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(`   Session active: ${sessionData.session ? '✅ Yes' : '❌ No'}`);
    
    // Sign out
    await supabase.auth.signOut();
    console.log(`   Signed out: ✅ Success`);
    
    return {
      role: account.role,
      email: account.email,
      success: true,
      userId: data.user?.id,
      userRole: data.user?.user_metadata?.role
    };
    
  } catch (error) {
    console.log(`❌ Demo login exception for ${account.role}:`, error.message);
    return {
      role: account.role,
      email: account.email,
      success: false,
      error: error.message
    };
  }
}

// Function to test all demo accounts
async function testAllDemoLogins() {
  console.log('🔐 Testing all PropertyMasters demo accounts...');
  
  const results = [];
  
  for (const account of demoAccounts) {
    const result = await testDemoLogin(account);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Function to display comprehensive summary
function displaySummary(results) {
  console.log('\n📊 PropertyMasters Demo Login Test Summary');
  console.log('==========================================');
  
  let successCount = 0;
  let failureCount = 0;
  
  console.log('\n🎭 Demo Account Test Results:');
  results.forEach(result => {
    if (result.success) {
      console.log(`   ${result.role.padEnd(10)}: ✅ Login successful`);
      console.log(`                    📧 ${result.email}`);
      console.log(`                    👤 Role: ${result.userRole || 'Not set'}`);
      successCount++;
    } else {
      console.log(`   ${result.role.padEnd(10)}: ❌ Login failed`);
      console.log(`                    📧 ${result.email}`);
      console.log(`                    ⚠️  Error: ${result.error}`);
      failureCount++;
    }
    console.log('');
  });
  
  console.log(`📈 Test Statistics:`);
  console.log(`   ✅ Successful logins: ${successCount}/${results.length}`);
  console.log(`   ❌ Failed logins: ${failureCount}/${results.length}`);
  console.log(`   📊 Success rate: ${Math.round((successCount / results.length) * 100)}%`);
  
  if (successCount === results.length) {
    console.log('\n🎉 All PropertyMasters demo accounts are working perfectly!');
    console.log('✅ Ready for production deployment!');
  } else if (successCount > 0) {
    console.log('\n⚠️  Some demo accounts are working, but issues remain.');
    console.log('🔧 Check email confirmation settings in Supabase.');
  } else {
    console.log('\n❌ No demo accounts are working.');
    console.log('🔧 Check Supabase configuration and email settings.');
  }
  
  console.log('\n📋 Demo Account Credentials for Web Interface:');
  console.log('===============================================');
  demoAccounts.forEach(account => {
    console.log(`${account.role.padEnd(10)}: ${account.email} / ${account.password}`);
  });
}

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

// Main execution function
async function main() {
  console.log('🚀 PropertyMasters UK - Demo Login Test Script');
  console.log('==============================================');
  console.log('Testing demo login functionality with @propertymasters.com accounts\n');
  
  // Test connection first
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  // Test all demo logins
  const results = await testAllDemoLogins();
  
  // Display comprehensive summary
  displaySummary(results);
  
  console.log('\n🌐 Next Steps:');
  console.log('1. Open http://localhost:3000/ in your browser');
  console.log('2. Click on any demo account button to test login');
  console.log('3. If email confirmation is required, check Supabase Auth settings');
  console.log('4. For production, consider disabling email confirmation for demo accounts');
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error.message);
  process.exit(1);
});