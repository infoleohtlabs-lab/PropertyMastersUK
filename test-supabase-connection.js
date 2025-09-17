const fs = require('fs');
const path = require('path');

// Read environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, 'frontend', '.env');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Failed to read .env file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Environment Configuration Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Present' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Try to load Supabase client
let createClient;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
  console.log('✅ @supabase/supabase-js module loaded successfully');
} catch (error) {
  console.error('❌ Failed to load @supabase/supabase-js:', error.message);
  console.log('💡 Try running: npm install @supabase/supabase-js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n📡 Testing basic connection...');
    const { data, error } = await supabase.from('properties').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check authentication settings
    console.log('\n🔐 Testing authentication settings...');
    
    // Try to get auth settings (this might fail but will give us info)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session check:', authError ? authError.message : 'No active session (expected)');
    
    // Test 3: Try to create a test user with a simple email
    console.log('\n👤 Testing user creation with simple email...');
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined
      }
    });
    
    if (signUpError) {
      console.error('❌ User creation failed:', signUpError.message);
      console.log('Error details:', JSON.stringify(signUpError, null, 2));
      
      // Check if it's an email validation issue
      if (signUpError.message.includes('invalid') || signUpError.message.includes('email')) {
        console.log('\n🔍 This appears to be an email validation issue.');
        console.log('Possible causes:');
        console.log('- Email domain restrictions in Supabase Auth settings');
        console.log('- Custom email validation rules');
        console.log('- SMTP configuration issues');
      }
    } else {
      console.log('✅ User creation successful:', {
        user: signUpData.user?.email,
        needsConfirmation: !signUpData.session
      });
    }
    
    // Test 4: Check if users table exists
    console.log('\n📋 Checking users table...');
    const { data: usersData, error: usersError } = await supabase.from('users').select('count').limit(1);
    
    if (usersError) {
      console.log('❌ Users table check failed:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    console.log(success ? '✅ Connection test completed' : '❌ Connection test failed');
    console.log('='.repeat(50));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
  });