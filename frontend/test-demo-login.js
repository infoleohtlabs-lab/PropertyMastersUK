import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://himanwdawxstxwphimhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

const supabase = createClient(supabaseUrl, supabaseKey);

const demoCredentials = {
  admin: { email: 'admin.demo@gmail.com', password: 'PropertyTest2024!' },
  agent: { email: 'agent.demo@gmail.com', password: 'PropertyTest2024!' },
  landlord: { email: 'landlord.demo@gmail.com', password: 'PropertyTest2024!' },
  tenant: { email: 'tenant.demo@gmail.com', password: 'PropertyTest2024!' },
  solicitor: { email: 'solicitor.demo@gmail.com', password: 'PropertyTest2024!' },
  buyer: { email: 'buyer.demo@gmail.com', password: 'PropertyTest2024!' }
};

async function testDemoLogin(role) {
  try {
    console.log(`\n🔐 Testing ${role} login...`);
    
    const credentials = demoCredentials[role];
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) {
      console.log(`❌ ${role} login failed:`, error.message);
      return false;
    }
    
    if (data.user) {
      console.log(`✅ ${role} login successful`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Email Verified: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Test logout
      await supabase.auth.signOut();
      console.log(`   Logout successful`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.log(`❌ ${role} login error:`, err.message);
    return false;
  }
}

async function testAllDemoLogins() {
  console.log('🚀 Testing all demo login functionality...');
  
  const roles = ['admin', 'agent', 'landlord', 'tenant', 'solicitor', 'buyer'];
  const results = {};
  
  for (const role of roles) {
    results[role] = await testDemoLogin(role);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let successCount = 0;
  for (const [role, success] of Object.entries(results)) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${role.padEnd(10)}: ${status}`);
    if (success) successCount++;
  }
  
  console.log(`\n🎯 Overall: ${successCount}/${roles.length} demo accounts working`);
  
  if (successCount === roles.length) {
    console.log('🎉 All demo login functionality is working correctly!');
  } else {
    console.log('⚠️  Some demo accounts need attention.');
  }
}

testAllDemoLogins().catch(console.error);