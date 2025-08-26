// Test script to verify authentication endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3005';

// Test users from seeding
const testUsers = [
  { email: 'admin@propertymastersuk.com', password: 'password123', role: 'admin' },
  { email: 'agent@propertymastersuk.com', password: 'password123', role: 'agent' },
  { email: 'landlord@propertymastersuk.com', password: 'password123', role: 'landlord' },
  { email: 'tenant@propertymastersuk.com', password: 'password123', role: 'tenant' },
  { email: 'buyer@propertymastersuk.com', password: 'password123', role: 'buyer' },
  { email: 'solicitor@propertymastersuk.com', password: 'password123', role: 'solicitor' }
];

async function testLogin(user) {
  try {
    console.log(`\n🔐 Testing login for ${user.role}: ${user.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Login successful for ${user.role}`);
      console.log(`   Token: ${response.data.access_token.substring(0, 20)}...`);
      console.log(`   User ID: ${response.data.user?.id}`);
      console.log(`   User Role: ${response.data.user?.role}`);
      return response.data;
    } else {
      console.log(`❌ Login failed for ${user.role}: No token received`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login failed for ${user.role}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testAuthEndpoints() {
  console.log('🚀 Starting Authentication Tests');
  console.log('================================');
  
  // Test backend connectivity
  try {
    const healthCheck = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend server is accessible');
  } catch (error) {
    console.log('❌ Backend server is not accessible:', error.message);
    return;
  }
  
  // Test each user login
  const results = [];
  for (const user of testUsers) {
    const result = await testLogin(user);
    results.push({ user, success: !!result, data: result });
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Successful logins: ${successful}/${total}`);
  
  if (successful === total) {
    console.log('🎉 All authentication tests passed!');
  } else {
    console.log('⚠️  Some authentication tests failed');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.user.role} (${r.user.email})`);
    });
  }
}

// Run the tests
testAuthEndpoints().catch(console.error);