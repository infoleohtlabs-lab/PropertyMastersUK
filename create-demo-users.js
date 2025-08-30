const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

// Note: For user creation, we need the service role key, but we'll try with anon key first
// and provide instructions for getting the service role key if needed
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Demo users to create
const demoUsers = [
  {
    email: 'admin@demo.com',
    password: 'demo123456',
    role: 'admin',
    user_metadata: {
      full_name: 'Demo Admin',
      role: 'admin'
    }
  },
  {
    email: 'agent@demo.com',
    password: 'demo123456',
    role: 'agent',
    user_metadata: {
      full_name: 'Demo Agent',
      role: 'agent'
    }
  },
  {
    email: 'landlord@demo.com',
    password: 'demo123456',
    role: 'landlord',
    user_metadata: {
      full_name: 'Demo Landlord',
      role: 'landlord'
    }
  },
  {
    email: 'tenant@demo.com',
    password: 'demo123456',
    role: 'tenant',
    user_metadata: {
      full_name: 'Demo Tenant',
      role: 'tenant'
    }
  },
  {
    email: 'buyer@demo.com',
    password: 'demo123456',
    role: 'buyer',
    user_metadata: {
      full_name: 'Demo Buyer',
      role: 'buyer'
    }
  },
  {
    email: 'solicitor@demo.com',
    password: 'demo123456',
    role: 'solicitor',
    user_metadata: {
      full_name: 'Demo Solicitor',
      role: 'solicitor'
    }
  }
];

async function createDemoUsers() {
  console.log('🚀 Starting demo user creation process...');
  console.log('📧 Creating users with Supabase Auth...');
  
  const results = [];
  
  for (const user of demoUsers) {
    try {
      console.log(`\n👤 Creating user: ${user.email}`);
      
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.user_metadata
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
          results.push({ email: user.email, status: 'already_exists', error: null });
        } else {
          console.log(`   ❌ Failed to create ${user.email}: ${error.message}`);
          results.push({ email: user.email, status: 'failed', error: error.message });
        }
      } else {
        console.log(`   ✅ Successfully created ${user.email}`);
        if (data.user) {
          console.log(`   📝 User ID: ${data.user.id}`);
        }
        results.push({ email: user.email, status: 'created', error: null, user: data.user });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.log(`   💥 Unexpected error creating ${user.email}: ${err.message}`);
      results.push({ email: user.email, status: 'error', error: err.message });
    }
  }
  
  return results;
}

async function verifyUsers() {
  console.log('\n🔍 Verifying created users...');
  
  try {
    // Try to get user list (this might not work with anon key)
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('⚠️  Cannot verify users with current permissions.');
      console.log('   This is expected when using anon key instead of service role key.');
      return;
    }
    
    if (data && data.users) {
      console.log(`📊 Total users in database: ${data.users.length}`);
      
      const demoEmails = demoUsers.map(u => u.email);
      const foundDemoUsers = data.users.filter(user => 
        demoEmails.includes(user.email)
      );
      
      console.log(`🎯 Demo users found: ${foundDemoUsers.length}/${demoUsers.length}`);
      
      foundDemoUsers.forEach(user => {
        console.log(`   ✅ ${user.email} (ID: ${user.id})`);
      });
    }
  } catch (err) {
    console.log(`❌ Error verifying users: ${err.message}`);
  }
}

async function testLogin() {
  console.log('\n🔐 Testing login with demo accounts...');
  
  // Test login with first user
  const testUser = demoUsers[0];
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (error) {
      console.log(`❌ Login test failed: ${error.message}`);
    } else {
      console.log(`✅ Login test successful for ${testUser.email}`);
      console.log(`   User ID: ${data.user?.id}`);
      
      // Sign out after test
      await supabase.auth.signOut();
      console.log('   🚪 Signed out after test');
    }
  } catch (err) {
    console.log(`💥 Login test error: ${err.message}`);
  }
}

async function main() {
  try {
    console.log('🏠 Property Masters UK - Demo User Creation Script');
    console.log('=' .repeat(50));
    
    // Check Supabase connection
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Create demo users
    const results = await createDemoUsers();
    
    // Verify users
    await verifyUsers();
    
    // Test login
    await testLogin();
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log('=' .repeat(30));
    
    const created = results.filter(r => r.status === 'created').length;
    const existing = results.filter(r => r.status === 'already_exists').length;
    const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
    
    console.log(`✅ Created: ${created}`);
    console.log(`⚠️  Already existed: ${existing}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed users:');
      results.filter(r => r.status === 'failed' || r.status === 'error')
        .forEach(r => console.log(`   - ${r.email}: ${r.error}`));
    }
    
    console.log('\n🎉 Demo user creation process completed!');
    console.log('\n📝 Note: If you need to use admin functions, you\'ll need the service role key.');
    console.log('   You can find it in your Supabase dashboard under Settings > API.');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createDemoUsers, verifyUsers, testLogin };