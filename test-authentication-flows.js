// Test Authentication Flows
// This script tests the login functionality with the newly created users

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Found' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Found' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users with their credentials
const testUsers = [
  { role: 'admin', email: 'admin.propertymaster@outlook.com', password: 'AdminPass123!' },
  { role: 'agent', email: 'agent.propertymaster@hotmail.com', password: 'AgentPass123!' },
  { role: 'landlord', email: 'landlord.propertymaster@outlook.com', password: 'LandlordPass123!' },
  { role: 'tenant', email: 'tenant.propertymaster@hotmail.com', password: 'TenantPass123!' },
  { role: 'buyer', email: 'buyer.propertymaster@himanwdawxstxwphimhw.supabase.co', password: 'BuyerPass123!' },
  { role: 'solicitor', email: 'solicitor.propertymaster@himanwdawxstxwphimhw.supabase.co', password: 'SolicitorPass123!' }
];

async function testAuthentication() {
  console.log('🔐 Testing Authentication Flows');
  console.log('================================\n');

  let successCount = 0;
  let failureCount = 0;

  for (const user of testUsers) {
    console.log(`Testing ${user.role} login (${user.email})...`);
    
    try {
      // Test login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`❌ ${user.role} login failed: ${error.message}`);
        failureCount++;
      } else if (data.user) {
        console.log(`✅ ${user.role} login successful`);
        console.log(`   User ID: ${data.user.id}`);
        console.log(`   Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
        successCount++;
        
        // Sign out after successful login
        await supabase.auth.signOut();
      } else {
        console.log(`❌ ${user.role} login failed: No user data returned`);
        failureCount++;
      }
    } catch (err) {
      console.log(`❌ ${user.role} login error: ${err.message}`);
      failureCount++;
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('\n📊 Authentication Test Summary');
  console.log('==============================');
  console.log(`✅ Successful logins: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed logins: ${failureCount}/${testUsers.length}`);
  
  if (successCount === testUsers.length) {
    console.log('\n🎉 All authentication flows are working correctly!');
  } else if (successCount > 0) {
    console.log('\n⚠️  Some authentication flows need attention.');
    console.log('Note: Users may need email confirmation to login successfully.');
  } else {
    console.log('\n🚨 All authentication flows failed. Please check configuration.');
  }

  return { successCount, failureCount, total: testUsers.length };
}

// Run the test
testAuthentication()
  .then((results) => {
    console.log('\n🏁 Authentication testing completed.');
    process.exit(results.failureCount > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  });