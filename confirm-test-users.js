// Confirm Test Users for Development
// This script confirms user emails using the service role key

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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Found' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ Found' : '❌ Missing');
  console.log('\n💡 Note: You need the service role key to confirm users programmatically.');
  console.log('Please check your .env file or Supabase project settings.');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users to confirm
const testUsers = [
  'admin.propertymaster@outlook.com',
  'agent.propertymaster@hotmail.com',
  'landlord.propertymaster@outlook.com',
  'tenant.propertymaster@hotmail.com',
  'buyer.propertymaster@himanwdawxstxwphimhw.supabase.co',
  'solicitor.propertymaster@himanwdawxstxwphimhw.supabase.co'
];

async function confirmUsers() {
  console.log('📧 Confirming Test User Emails');
  console.log('==============================\n');

  let confirmedCount = 0;
  let failureCount = 0;

  for (const email of testUsers) {
    console.log(`Confirming ${email}...`);
    
    try {
      // First, get the user by email
      const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (getUserError) {
        console.log(`❌ Error fetching users: ${getUserError.message}`);
        failureCount++;
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        failureCount++;
        continue;
      }

      if (user.email_confirmed_at) {
        console.log(`✅ ${email} already confirmed`);
        confirmedCount++;
        continue;
      }

      // Confirm the user's email
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          email_confirm: true
        }
      );

      if (error) {
        console.log(`❌ Failed to confirm ${email}: ${error.message}`);
        failureCount++;
      } else {
        console.log(`✅ ${email} confirmed successfully`);
        confirmedCount++;
      }
    } catch (err) {
      console.log(`❌ Error confirming ${email}: ${err.message}`);
      failureCount++;
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('\n📊 Email Confirmation Summary');
  console.log('=============================');
  console.log(`✅ Confirmed emails: ${confirmedCount}/${testUsers.length}`);
  console.log(`❌ Failed confirmations: ${failureCount}/${testUsers.length}`);
  
  if (confirmedCount === testUsers.length) {
    console.log('\n🎉 All user emails have been confirmed!');
    console.log('You can now test the login flows.');
  } else if (confirmedCount > 0) {
    console.log('\n⚠️  Some email confirmations failed.');
  } else {
    console.log('\n🚨 All email confirmations failed. Please check configuration.');
  }

  return { confirmedCount, failureCount, total: testUsers.length };
}

// Run the confirmation
confirmUsers()
  .then((results) => {
    console.log('\n🏁 Email confirmation completed.');
    process.exit(results.failureCount > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n💥 Confirmation execution failed:', error.message);
    process.exit(1);
  });