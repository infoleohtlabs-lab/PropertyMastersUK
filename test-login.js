const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test credentials that should match the Login component
const testCredentials = [
  { email: 'admin@propertymastersuk.com', password: 'admin123', role: 'admin' },
  { email: 'agent@propertymastersuk.com', password: 'agent123', role: 'agent' },
  { email: 'landlord@propertymastersuk.com', password: 'landlord123', role: 'landlord' },
  { email: 'tenant@propertymastersuk.com', password: 'tenant123', role: 'tenant' },
  { email: 'solicitor@propertymastersuk.com', password: 'solicitor123', role: 'solicitor' },
  { email: 'buyer@propertymastersuk.com', password: 'buyer123', role: 'buyer' }
];

async function testLogin() {
  console.log('🔐 Testing login functionality with demo credentials...');
  
  for (const cred of testCredentials) {
    console.log(`\n📧 Testing login for: ${cred.email}`);
    
    try {
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.error(`❌ Login failed for ${cred.email}:`, error.message);
      } else {
        console.log(`✅ Login successful for ${cred.email}`);
        console.log(`   User ID: ${data.user.id}`);
        console.log(`   Email: ${data.user.email}`);
        
        // Sign out to test next user
        await supabase.auth.signOut();
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${cred.email}:`, error.message);
    }
  }
  
  console.log('\n🎯 Login testing completed!');
}

// Run the test
testLogin().catch(console.error);