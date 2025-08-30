const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.log('Please ensure you have:');
  console.log('- VITE_SUPABASE_URL in your .env file');
  console.log('- SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo users to confirm
const demoUsers = [
  { email: 'admin@demo.com', role: 'Admin' },
  { email: 'agent@demo.com', role: 'Agent' },
  { email: 'landlord@demo.com', role: 'Landlord' },
  { email: 'tenant@demo.com', role: 'Tenant' },
  { email: 'buyer@demo.com', role: 'Buyer' },
  { email: 'solicitor@demo.com', role: 'Solicitor' }
];

async function confirmDemoUsers() {
  console.log('🏠 Property Masters UK - Demo User Email Confirmation');
  console.log('====================================================');
  
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test connection
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return;
  }

  console.log('📧 Confirming demo user emails...');
  
  let confirmed = 0;
  let failed = 0;
  
  for (const user of demoUsers) {
    try {
      console.log(`\n👤 Confirming email for: ${user.email}`);
      
      // First, get the user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      const foundUser = users.users.find(u => u.email === user.email);
      if (!foundUser) {
        console.log(`   ⚠️  User not found: ${user.email}`);
        failed++;
        continue;
      }
      
      // Update user to confirm email
      const { data, error } = await supabase.auth.admin.updateUserById(
        foundUser.id,
        {
          email_confirm: true,
          user_metadata: {
            role: user.role.toLowerCase(),
            confirmed_at: new Date().toISOString()
          }
        }
      );
      
      if (error) throw error;
      
      console.log(`   ✅ Successfully confirmed: ${user.email}`);
      console.log(`   📝 User ID: ${foundUser.id}`);
      confirmed++;
      
    } catch (error) {
      console.log(`   ❌ Failed to confirm ${user.email}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n🔍 Verifying confirmed users...');
  
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    
    console.log('\n📋 User Status Summary:');
    console.log('========================');
    
    for (const user of demoUsers) {
      const foundUser = users.users.find(u => u.email === user.email);
      if (foundUser) {
        const isConfirmed = foundUser.email_confirmed_at ? '✅ Confirmed' : '❌ Not Confirmed';
        console.log(`${user.role.padEnd(10)} (${user.email}): ${isConfirmed}`);
      } else {
        console.log(`${user.role.padEnd(10)} (${user.email}): ❌ Not Found`);
      }
    }
    
  } catch (error) {
    console.log('⚠️  Could not verify user status:', error.message);
  }
  
  console.log('\n📋 SUMMARY');
  console.log('==============================');
  console.log(`✅ Confirmed: ${confirmed}`);
  console.log(`❌ Failed: ${failed}`);
  
  console.log('\n🎉 Demo user email confirmation process completed!');
  
  if (confirmed > 0) {
    console.log('\n🔐 You can now test login with these credentials:');
    demoUsers.forEach(user => {
      console.log(`   ${user.role}: ${user.email} / demo123456`);
    });
  }
}

// Run the confirmation process
confirmDemoUsers().catch(console.error);