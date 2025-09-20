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

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...');
  
  try {
    // Check if users table exists and get its structure
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing users table:', error.message);
      
      // Try to get table information from information_schema
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_constraints', { table_name: 'users' })
        .single();
        
      if (schemaError) {
        console.log('📋 Let\'s check what tables exist:');
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        if (!tablesError && tables) {
          console.log('Available tables:', tables.map(t => t.table_name));
        }
      }
      
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Try to get constraint information
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.check_constraints')
      .select('*')
      .like('constraint_name', '%users_role_check%');
      
    if (!constraintError && constraints) {
      console.log('🔍 Role constraints found:', constraints);
    }
    
    // Try to insert a test record to see what roles are allowed
    console.log('\n🧪 Testing role constraints...');
    
    const testRoles = ['admin', 'agent', 'landlord', 'tenant', 'buyer', 'solicitor'];
    
    for (const role of testRoles) {
      const { error: testError } = await supabase
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000000', // Dummy ID that will fail on unique constraint
          email: 'test@test.com',
          role: role,
          first_name: 'Test',
          last_name: 'User'
        });
        
      if (testError) {
        if (testError.message.includes('users_role_check')) {
          console.log(`❌ Role '${role}' is NOT allowed`);
        } else if (testError.message.includes('duplicate key') || testError.message.includes('already exists')) {
          console.log(`✅ Role '${role}' is allowed (failed on duplicate key, which is expected)`);
        } else {
          console.log(`⚠️  Role '${role}' test failed with: ${testError.message}`);
        }
      } else {
        console.log(`✅ Role '${role}' is allowed`);
        // Clean up the test record
        await supabase
          .from('users')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkUsersTable().catch(console.error);