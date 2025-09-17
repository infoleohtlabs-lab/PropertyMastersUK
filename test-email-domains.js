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

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

// Test different email domains to find which ones are allowed
const testDomains = [
  'propertymastersuk.com',
  'himanwdawxstxwphimhw.supabase.co', // Try the supabase domain itself
  'localhost',
  'test.local',
  'dev.local',
  'example.org',
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'protonmail.com'
];

async function testEmailDomains() {
  console.log('🔍 Testing different email domains to find allowed ones...');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const domain of testDomains) {
    const testEmail = `test@${domain}`;
    const testPassword = 'TestPassword123!';
    
    try {
      console.log(`\n📧 Testing: ${testEmail}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: undefined
        }
      });
      
      if (error) {
        console.log(`❌ Failed: ${error.message}`);
        results.push({ domain, email: testEmail, success: false, error: error.message });
      } else {
        console.log(`✅ Success: User created (${data.user?.email})`);
        results.push({ domain, email: testEmail, success: true, needsConfirmation: !data.session });
        
        // If successful, try to clean up by deleting the user (this might not work with anon key)
        // We'll leave them for now
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.message}`);
      results.push({ domain, email: testEmail, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY OF EMAIL DOMAIN TESTING');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ ALLOWED DOMAINS:');
    successful.forEach(result => {
      console.log(`  • ${result.domain} (${result.email})`);
      if (result.needsConfirmation) {
        console.log(`    ⚠️  Requires email confirmation`);
      }
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ REJECTED DOMAINS:');
    failed.forEach(result => {
      console.log(`  • ${result.domain}: ${result.error}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (successful.length > 0) {
    console.log(`  • Use emails from allowed domains: ${successful.map(r => r.domain).join(', ')}`);
    console.log(`  • Update your user creation scripts to use these domains`);
  } else {
    console.log(`  • No domains were successful - check Supabase Auth settings`);
    console.log(`  • Contact Supabase admin to review email domain restrictions`);
  }
  
  return successful.length > 0;
}

// Run the test
testEmailDomains()
  .then(hasSuccess => {
    console.log('\n' + '='.repeat(60));
    console.log(hasSuccess ? '✅ Found working email domains' : '❌ No working email domains found');
    console.log('='.repeat(60));
    process.exit(hasSuccess ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
  });