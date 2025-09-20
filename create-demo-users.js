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

// Demo accounts from Login.tsx
const demoAccounts = [
  {
    email: 'admin@propertymastersuk.com',
    password: 'admin123',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User'
  },
  {
    email: 'agent@propertymastersuk.com',
    password: 'agent123',
    role: 'agent',
    first_name: 'Agent',
    last_name: 'User'
  },
  {
    email: 'landlord@propertymastersuk.com',
    password: 'landlord123',
    role: 'landlord',
    first_name: 'Landlord',
    last_name: 'User'
  },
  {
    email: 'tenant@propertymastersuk.com',
    password: 'tenant123',
    role: 'tenant',
    first_name: 'Tenant',
    last_name: 'User'
  }
];

async function createDemoUsers() {
  console.log('👥 Creating demo users in Supabase Auth...');
  
  for (const account of demoAccounts) {
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
          
          // Try to get existing user
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          if (!listError && existingUsers) {
            const existingUser = existingUsers.users.find(u => u.email === account.email);
            if (existingUser) {
              console.log(`✅ Found existing user: ${existingUser.id}`);
              
              // Try to create/update user profile in users table
              await createUserProfile(existingUser.id, account);
            }
          }
        } else {
          console.error(`❌ Auth error for ${account.email}:`, authError.message);
        }
        continue;
      }
      
      console.log(`✅ Auth user created: ${authData.user.id}`);
      
      // Create user profile in users table
      await createUserProfile(authData.user.id, account);
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${account.email}:`, error.message);
    }
  }
}

async function createUserProfile(userId, account) {
  console.log(`👤 Creating profile for user: ${userId}`);
  
  try {
    // First, try to check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log(`✅ Profile already exists for ${account.email}`);
      return;
    }
    
    // Create new profile - try with just the allowed roles first
    const allowedRoles = ['admin', 'agent'];
    const roleToUse = allowedRoles.includes(account.role) ? account.role : 'agent';
    
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
      
      // If it's a role constraint error, let's try to understand what roles are allowed
      if (profileError.message.includes('users_role_check')) {
        console.log(`⚠️  Role '${roleToUse}' not allowed. Trying with 'admin'...`);
        
        const { data: retryData, error: retryError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: account.email,
            first_name: account.first_name,
            last_name: account.last_name,
            role: 'admin', // Force admin role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (retryError) {
          console.error(`❌ Retry failed for ${account.email}:`, retryError.message);
        } else {
          console.log(`✅ Profile created with admin role for ${account.email}`);
        }
      }
    } else {
      console.log(`✅ Profile created for ${account.email}`);
    }
    
  } catch (error) {
    console.error(`❌ Profile creation failed for ${account.email}:`, error.message);
  }
}

// Run the creation process
createDemoUsers().catch(console.error);