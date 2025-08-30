// Simple login test script to verify Supabase authentication
import { authService } from './services/authService.js';

// Test credentials for different user roles
const testUsers = [
  {
    email: 'admin@propertymastersuk.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    email: 'agent@propertymastersuk.com', 
    password: 'Agent123!',
    role: 'agent'
  },
  {
    email: 'landlord@propertymastersuk.com',
    password: 'Landlord123!', 
    role: 'landlord'
  },
  {
    email: 'tenant@propertymastersuk.com',
    password: 'Tenant123!',
    role: 'tenant'
  },
  {
    email: 'buyer@propertymastersuk.com',
    password: 'Buyer123!',
    role: 'buyer'
  },
  {
    email: 'solicitor@propertymastersuk.com',
    password: 'Solicitor123!',
    role: 'solicitor'
  }
];

async function testLogin(credentials) {
  try {
    console.log(`Testing login for ${credentials.role}: ${credentials.email}`);
    
    const response = await authService.login({
      email: credentials.email,
      password: credentials.password
    });
    
    console.log(`✅ Login successful for ${credentials.role}:`, {
      userId: response.user.id,
      email: response.user.email,
      role: response.user.role,
      token: response.token ? 'Present' : 'Missing'
    });
    
    // Test logout
    await authService.logout();
    console.log(`✅ Logout successful for ${credentials.role}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Login failed for ${credentials.role}:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase Authentication Tests...');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  
  for (const user of testUsers) {
    const success = await testLogin(user);
    if (success) successCount++;
    console.log('-'.repeat(30));
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Successful logins: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed logins: ${testUsers.length - successCount}/${testUsers.length}`);
  
  if (successCount === testUsers.length) {
    console.log('🎉 All authentication tests passed!');
  } else {
    console.log('⚠️  Some authentication tests failed. Check the logs above.');
  }
}

// Export for use in browser console
window.testLogin = testLogin;
window.runAllTests = runAllTests;
window.authService = authService;

console.log('🔧 Login test functions loaded. Use runAllTests() to test all users or testLogin(credentials) for individual tests.');