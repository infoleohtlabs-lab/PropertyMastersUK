#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script applies Supabase migrations in the correct order:
 * 1. 001_initial_schema.sql
 * 2. 002_additional_tables.sql
 * 3. 002_seed_data.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration from supabase-connection-test.js
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Migration files in order
const MIGRATION_FILES = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_additional_tables.sql',
  'supabase/migrations/002_seed_data.sql'
];

/**
 * Execute SQL from file using raw SQL execution
 */
async function executeSqlFile(filePath) {
  console.log(`\n📄 Executing: ${filePath}`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Clean up SQL content - remove comments and empty lines
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--');
      })
      .join('\n');
    
    // Split by semicolons to get individual statements
    const statements = cleanedSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          // Use the rpc function to execute raw SQL
          const { data, error } = await supabase.rpc('exec_sql', {
            query: statement
          });
          
          if (error) {
            console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
            errorCount++;
            
            // For certain errors, we might want to continue
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key')) {
              console.log(`   ⚠️  Continuing despite duplicate/exists error...`);
            } else {
              // For critical errors, we might want to stop
              console.log(`   ⚠️  Continuing with next statement...`);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ Exception in statement ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`   📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    if (successCount > 0) {
      console.log(`   ✅ File ${filePath} processed (${successCount}/${statements.length} statements succeeded)`);
      return true;
    } else {
      console.log(`   ❌ File ${filePath} failed - no statements executed successfully`);
      return false;
    }
  } catch (err) {
    console.error(`   ❌ Error reading/executing ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Alternative method: Execute seed data using Supabase client methods
 */
async function executeSeedDataAlternative(filePath) {
  console.log(`\n📄 Executing seed data (alternative method): ${filePath}`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract INSERT statements
    const insertMatches = sqlContent.match(/INSERT INTO\s+(\w+)\s*\([^)]+\)\s*VALUES\s*\([^;]+\);/gi);
    
    if (!insertMatches || insertMatches.length === 0) {
      console.log('   No INSERT statements found');
      return true;
    }
    
    console.log(`   Found ${insertMatches.length} INSERT statements`);
    
    let successCount = 0;
    
    for (const insertStmt of insertMatches) {
      // Extract table name
      const tableMatch = insertStmt.match(/INSERT INTO\s+(\w+)/i);
      if (!tableMatch) continue;
      
      const tableName = tableMatch[1];
      console.log(`   Inserting data into ${tableName}...`);
      
      try {
        // Try to execute the INSERT statement directly
        const { data, error } = await supabase.rpc('exec_sql', {
          query: insertStmt
        });
        
        if (error) {
          console.error(`   ❌ Error inserting into ${tableName}:`, error.message);
        } else {
          console.log(`   ✅ Successfully inserted data into ${tableName}`);
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Exception inserting into ${tableName}:`, err.message);
      }
    }
    
    console.log(`   📊 Seed data results: ${successCount}/${insertMatches.length} successful`);
    return successCount > 0;
  } catch (err) {
    console.error('   ❌ Error executing seed data:', err.message);
    return false;
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using ANON key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  
  try {
    // Test with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error && !error.message.includes('permission denied')) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');
  
  const tablesToCheck = [
    'users', 'properties', 'property_images', 'property_features',
    'inquiries', 'viewings', 'favorites', 'saved_searches',
    'tenancies', 'rent_payments', 'lease_agreements',
    'financial_transactions', 'invoices', 'financial_reports',
    'maintenance_requests', 'contractors', 'work_orders', 'conversations'
  ];
  
  let existingTables = 0;
  let totalRecords = 0;
  
  for (const tableName of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ⚠️  Table ${tableName}: does not exist`);
        } else {
          console.log(`   ❌ Table ${tableName}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table ${tableName}: ${count || 0} records`);
        existingTables++;
        totalRecords += (count || 0);
      }
    } catch (err) {
      console.log(`   ❌ Table ${tableName}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Summary: ${existingTables}/${tablesToCheck.length} tables exist, ${totalRecords} total records`);
  return { existingTables, totalRecords };
}

/**
 * Main migration function
 */
async function runMigrations() {
  console.log('🚀 Starting Supabase Database Migration');
  console.log('='.repeat(50));
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  console.log('\n⚠️  Note: This script uses the anon key and may have limited permissions.');
  console.log('For full schema migrations, you may need to use the Supabase dashboard or service key.');
  
  let migrationsApplied = 0;
  
  // Execute migration files in order
  for (const migrationFile of MIGRATION_FILES) {
    if (!fs.existsSync(migrationFile)) {
      console.error(`\n❌ Migration file not found: ${migrationFile}`);
      continue;
    }
    
    let success = false;
    
    if (migrationFile.includes('seed_data')) {
      // Try alternative method for seed data
      success = await executeSeedDataAlternative(migrationFile);
      if (!success) {
        // Fallback to regular method
        success = await executeSqlFile(migrationFile);
      }
    } else {
      success = await executeSqlFile(migrationFile);
    }
    
    if (success) {
      migrationsApplied++;
    }
  }
  
  // Verify results
  const { existingTables, totalRecords } = await verifyMigration();
  
  console.log('\n🎉 Migration script completed!');
  console.log(`📊 Applied ${migrationsApplied}/${MIGRATION_FILES.length} migration files`);
  console.log(`📊 Found ${existingTables} tables with ${totalRecords} total records`);
  
  if (existingTables === 0) {
    console.log('\n⚠️  No tables found. You may need to:');
    console.log('   1. Apply schema migrations manually in Supabase dashboard');
    console.log('   2. Use a service role key instead of anon key');
    console.log('   3. Check RLS policies and permissions');
  }
}

// Run migrations
if (require.main === module) {
  runMigrations().catch(err => {
    console.error('\n💥 Migration failed:', err.message);
    process.exit(1);
  });
}

module.exports = { runMigrations, testConnection, verifyMigration };