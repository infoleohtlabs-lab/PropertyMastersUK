#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * 
 * This script connects to Supabase using the JavaScript client library
 * and verifies the database connection and seed data.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from frontend/.env.example
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tables to verify
const TABLES_TO_CHECK = [
  'properties',
  'property_images', 
  'property_features',
  'inquiries',
  'viewings',
  'users',
  'agents',
  'landlords',
  'tenants',
  'buyers'
];

/**
 * Test database connection
 */
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using ANON key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    // Test basic connection by querying a simple table
    const { data, error } = await supabase
      .from('properties')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
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
 * Get table record count
 */
async function getTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return { count: 0, error: error.message };
    }
    
    return { count: count || 0, error: null };
  } catch (err) {
    return { count: 0, error: err.message };
  }
}

/**
 * Get sample data from table
 */
async function getSampleData(tableName, limit = 3) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) {
      return { data: [], error: error.message };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

/**
 * Verify seed data in all tables
 */
async function verifySeedData() {
  console.log('📊 Verifying seed data in tables...');
  console.log('\n');
  
  const results = {};
  let totalRecords = 0;
  
  for (const tableName of TABLES_TO_CHECK) {
    console.log(`🔍 Checking table: ${tableName}`);
    
    // Get record count
    const countResult = await getTableCount(tableName);
    
    if (countResult.error) {
      console.log(`   ❌ Error: ${countResult.error}`);
      results[tableName] = { count: 0, error: countResult.error, sample: [] };
      continue;
    }
    
    const count = countResult.count;
    totalRecords += count;
    
    console.log(`   📈 Records: ${count}`);
    
    // Get sample data if records exist
    let sampleData = [];
    if (count > 0) {
      const sampleResult = await getSampleData(tableName);
      if (!sampleResult.error) {
        sampleData = sampleResult.data;
        console.log(`   📋 Sample data (${sampleData.length} records):`);
        sampleData.forEach((record, index) => {
          const keys = Object.keys(record).slice(0, 3); // Show first 3 fields
          const preview = keys.map(key => `${key}: ${record[key]}`).join(', ');
          console.log(`      ${index + 1}. ${preview}${Object.keys(record).length > 3 ? '...' : ''}`);
        });
      }
    }
    
    results[tableName] = {
      count,
      error: null,
      sample: sampleData
    };
    
    console.log('');
  }
  
  return { results, totalRecords };
}

/**
 * Test specific queries
 */
async function testSpecificQueries() {
  console.log('🧪 Testing specific queries...');
  console.log('\n');
  
  const tests = [
    {
      name: 'Properties with images',
      query: async () => {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            property_images(id, image_url)
          `)
          .limit(3);
        return { data, error };
      }
    },
    {
      name: 'Properties with features',
      query: async () => {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            property_features(feature_name, feature_value)
          `)
          .limit(3);
        return { data, error };
      }
    },
    {
      name: 'Recent inquiries',
      query: async () => {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        return { data, error };
      }
    },
    {
      name: 'Upcoming viewings',
      query: async () => {
        const { data, error } = await supabase
          .from('viewings')
          .select('*')
          .order('viewing_date', { ascending: true })
          .limit(3);
        return { data, error };
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`🔬 ${test.name}:`);
    try {
      const result = await test.query();
      if (result.error) {
        console.log(`   ❌ Error: ${result.error.message}`);
      } else {
        console.log(`   ✅ Success: ${result.data.length} records found`);
        if (result.data.length > 0) {
          console.log(`   📋 Sample: ${JSON.stringify(result.data[0], null, 2).substring(0, 200)}...`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    console.log('');
  }
}

/**
 * Generate summary report
 */
function generateSummary(verificationResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const { results, totalRecords } = verificationResults;
  
  console.log(`\n📊 Total records across all tables: ${totalRecords}`);
  console.log('\n📈 Table breakdown:');
  
  Object.entries(results).forEach(([tableName, result]) => {
    const status = result.error ? '❌' : (result.count > 0 ? '✅' : '⚠️');
    console.log(`   ${status} ${tableName}: ${result.count} records${result.error ? ` (${result.error})` : ''}`);
  });
  
  const tablesWithData = Object.values(results).filter(r => r.count > 0 && !r.error).length;
  const tablesWithErrors = Object.values(results).filter(r => r.error).length;
  
  console.log('\n🎯 Status:');
  console.log(`   ✅ Tables with data: ${tablesWithData}/${TABLES_TO_CHECK.length}`);
  console.log(`   ❌ Tables with errors: ${tablesWithErrors}/${TABLES_TO_CHECK.length}`);
  
  if (totalRecords > 0) {
    console.log('\n🎉 Database verification completed successfully!');
    console.log('   The seed data has been properly inserted and is accessible.');
  } else {
    console.log('\n⚠️  No data found in any tables.');
    console.log('   You may need to run the seed script to populate the database.');
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Supabase Database Verification');
  console.log('==========================================\n');
  
  // Test connection
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.log('\n❌ Cannot proceed without a valid connection.');
    process.exit(1);
  }
  
  // Verify seed data
  const verificationResults = await verifySeedData();
  
  // Test specific queries
  await testSpecificQueries();
  
  // Generate summary
  generateSummary(verificationResults);
  
  console.log('\n✨ Verification complete!');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, verifySeedData, testSpecificQueries };