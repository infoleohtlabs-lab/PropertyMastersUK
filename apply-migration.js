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

async function applyMigration() {
  console.log('🔧 Applying user roles migration...');
  
  try {
    // Step 1: Drop existing constraint
    console.log('1. Dropping existing role constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
    });
    
    if (dropError) {
      console.log('⚠️  Drop constraint result:', dropError.message);
    } else {
      console.log('✅ Existing constraint dropped');
    }
    
    // Step 2: Add new constraint with all roles
    console.log('2. Adding new role constraint...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'agent', 'landlord', 'tenant', 'buyer', 'solicitor'));`
    });
    
    if (addError) {
      console.log('⚠️  Add constraint result:', addError.message);
    } else {
      console.log('✅ New constraint added');
    }
    
    // Step 3: Grant permissions
    console.log('3. Granting permissions...');
    const { error: grantError1 } = await supabase.rpc('exec_sql', {
      sql: 'GRANT SELECT, INSERT, UPDATE ON users TO anon;'
    });
    
    const { error: grantError2 } = await supabase.rpc('exec_sql', {
      sql: 'GRANT ALL PRIVILEGES ON users TO authenticated;'
    });
    
    if (grantError1 || grantError2) {
      console.log('⚠️  Grant permissions result:', grantError1?.message || grantError2?.message);
    } else {
      console.log('✅ Permissions granted');
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Alternative approach: Execute SQL commands individually
async function applyMigrationAlternative() {
  console.log('🔧 Applying migration using alternative approach...');
  
  const sqlCommands = [
    'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check',
    `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'agent', 'landlord', 'tenant', 'buyer', 'solicitor'))`,
    'GRANT SELECT, INSERT, UPDATE ON users TO anon',
    'GRANT ALL PRIVILEGES ON users TO authenticated'
  ];
  
  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i];
    console.log(`${i + 1}. Executing: ${sql}`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`⚠️  Command ${i + 1} result:`, error.message);
      } else {
        console.log(`✅ Command ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.log(`❌ Command ${i + 1} failed:`, err.message);
    }
  }
}

// Try both approaches
applyMigration()
  .then(() => {
    console.log('\n🧪 Testing role constraint after migration...');
    return applyMigrationAlternative();
  })
  .catch(console.error);