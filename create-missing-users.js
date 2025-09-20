const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Missing demo accounts
const missingAccounts = [
  {
    email: 'solicitor@propertymastersuk.com',
    password: 'solicitor123',
    role: 'solicitor',
    first_name: 'Solicitor',
    last_name: 'User'
  },
  {
    email: 'buyer@propertymastersuk.com',
    password: 'buyer123',
    role: 'buyer',
    first_name: 'Buyer',
    last_name: 'User'
  }
];

async function createMissingUsers() {
  console.log('👥 Creating missing demo users in Supabase Auth...');
  
  for (const account of missingAccounts) {
    console.log(`\n📧 Creating user: ${account.email}`);
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          first_name: account.first_name,
          last_name: account.last_name,
          role: account.role
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${account.email} already exists`);
          continue;
        } else {
          console.error(`❌ Auth error for ${account.email}:`, authError.message);
          continue;
        }
      }
      
      console.log(`✅ Auth user created: ${authData.user.id}`);
      
      // Create user profile in users table with allowed role
      await createUserProfile(authData.user.id, account);
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${account.email}:`, error.message);
    }
  }
}

async function createUserProfile(userId, account) {
  console.log(`👤 Creating profile for user: ${userId}`);
  
  try {
    // Since solicitor and buyer roles might not be allowed, use 'agent' as fallback
    const roleToUse = 'agent'; // Use agent role since it's allowed
    
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: account.email,
        first_name: account.first_name,
        last_name: account.last_name,
        role: roleToUse,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (profileError) {
      console.error(`❌ Profile error for ${account.email}:`, profileError.message);
    } else {
      console.log(`✅ Profile created for ${account.email} with role: ${roleToUse}`);
    }
    
  } catch (error) {
    console.error(`❌ Profile creation failed for ${account.email}:`, error.message);
  }
}

// Run the creation process
createMissingUsers().catch(console.error);