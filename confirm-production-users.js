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

// Initialize Supabase client
function initializeSupabase() {
  const envVars = loadEnvConfig();
  
  const supabaseUrl = envVars.VITE_SUPABASE_URL;
  const supabaseServiceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Production test users to confirm
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

// Test Supabase connection
async function testConnection(supabase) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Confirm user email
async function confirmUserEmail(supabase, email) {
  try {
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.log(`⚠️  User not found: ${email}`);
      return false;
    }
    
    // Update user to confirm email
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    
    if (error) throw error;
    
    console.log(`✅ Email confirmed for: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to confirm email for ${email}:`, error.message);
    return false;
  }
}

// Test login for confirmed user
async function testUserLogin(supabase, email, password) {
  try {
    // Create a new client with anon key for testing login
    const envVars = loadEnvConfig();
    const testClient = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);
    
    const { data, error } = await testClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Sign out immediately
    await testClient.auth.signOut();
    
    console.log(`✅ Login test successful for: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Login test failed for ${email}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting production user email confirmation...');
  console.log('=' .repeat(60));
  
  const supabase = initializeSupabase();
  
  // Test connection
  const connectionOk = await testConnection(supabase);
  if (!connectionOk) {
    process.exit(1);
  }
  
  console.log('\n📧 Confirming user emails...');
  console.log('-'.repeat(40));
  
  let confirmedCount = 0;
  let loginTestCount = 0;
  
  for (const user of productionTestUsers) {
    console.log(`\nProcessing ${user.role}: ${user.email}`);
    
    // Confirm email
    const confirmed = await confirmUserEmail(supabase, user.email);
    if (confirmed) {
      confirmedCount++;
      
      // Test login with the production password
      const loginSuccess = await testUserLogin(supabase, user.email, 'PropertyTest2024!');
      if (loginSuccess) {
        loginTestCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONFIRMATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Users confirmed: ${confirmedCount}/${productionTestUsers.length}`);
  console.log(`✅ Login tests passed: ${loginTestCount}/${productionTestUsers.length}`);
  
  if (confirmedCount === productionTestUsers.length && loginTestCount === productionTestUsers.length) {
    console.log('\n🎉 All production test users are ready for login!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('-'.repeat(40));
    productionTestUsers.forEach(user => {
      console.log(`${user.role}: ${user.email}`);
    });
    console.log('Password: PropertyTest2024!');
    console.log('\n🌐 Test the application at your deployed URL');
  } else {
    console.log('\n⚠️  Some users may need manual confirmation or have login issues.');
    console.log('Please check the Supabase dashboard for user status.');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});