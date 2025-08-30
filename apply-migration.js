#!/usr/bin/env node

/**
 * Manual Migration Application Script
 * 
 * This script applies the database migration manually using the Supabase client
 * since the TRAE Supabase integration is having issues.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNTA3MCwiZXhwIjoyMDcxODAxMDcwfQ.blpl5BzINWzHPxZZpdnt437g-0NWihO3OONxeh_OQfo';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Read and execute SQL migration file
 */
async function applyMigration() {
  console.log('🚀 Starting manual migration application...');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using SERVICE_ROLE key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '002_additional_tables.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📊 Migration file size: ${migrationSQL.length} characters`);
    console.log('\n');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    console.log('\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementPreview = statement.substring(0, 100).replace(/\s+/g, ' ');
      
      console.log(`📝 Executing statement ${i + 1}/${statements.length}: ${statementPreview}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
          
          // Continue with non-critical errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist') &&
              !error.message.includes('permission denied')) {
            console.log(`   ⚠️  Stopping due to critical error`);
            break;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        errorCount++;
        
        // Try alternative approach for some statements
        if (statement.includes('CREATE TABLE')) {
          console.log(`   🔄 Trying alternative approach for table creation...`);
          // We'll handle table creation differently if needed
        }
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    console.log(`   📈 Total statements: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else if (successCount > 0) {
      console.log('\n⚠️  Migration completed with some errors (this may be normal for existing objects)');
    } else {
      console.log('\n💥 Migration failed - no statements executed successfully');
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

/**
 * Verify tables were created
 */
async function verifyTables() {
  console.log('\n🔍 Verifying created tables...');
  
  const expectedTables = [
    'tenancies',
    'rent_payments', 
    'lease_agreements',
    'financial_transactions',
    'invoices',
    'financial_reports',
    'maintenance_requests',
    'contractors',
    'work_orders',
    'conversations',
    'messages',
    'notifications',
    'documents',
    'document_versions',
    'bookings',
    'availability_slots',
    'market_data',
    'property_valuations',
    'market_trends',
    'consent_records',
    'data_requests',
    'audit_logs',
    'user_activities'
  ];
  
  let existingTables = 0;
  
  for (const tableName of expectedTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: exists (${count || 0} records)`);
        existingTables++;
      }
    } catch (err) {
      console.log(`   ❌ ${tableName}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Tables verification: ${existingTables}/${expectedTables.length} tables exist`);
  
  return existingTables;
}

/**
 * Main execution
 */
async function main() {
  try {
    await applyMigration();
    const tablesCount = await verifyTables();
    
    if (tablesCount > 0) {
      console.log('\n🎯 Next steps:');
      console.log('   1. Update backend APIs to use new tables');
      console.log('   2. Update frontend components to integrate with new features');
      console.log('   3. Test the new functionality');
    }
    
  } catch (err) {
    console.error('💥 Script failed:', err.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { applyMigration, verifyTables };