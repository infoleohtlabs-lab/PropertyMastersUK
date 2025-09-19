const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_PREFIX = '/api';

async function testEndpoint(method, endpoint, data = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    
    const config = {
      method,
      url: `${BASE_URL}${API_PREFIX}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
    
    const response = await axios(config);
    console.log(`✅ Success: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.response ? error.response.status : 'Network Error'}`);
    if (error.response) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error message:', error.message);
    }
    return false;
  }
}

async function runSimpleTests() {
  console.log('🚀 Running Simple Buyer Endpoints Test');
  console.log('=====================================');
  
  // Test server connectivity
  console.log('\n🔍 Testing server connectivity...');
  try {
    const response = await axios.get(`${BASE_URL}${API_PREFIX}/buyers`, { timeout: 5000 });
    console.log('✅ Server is running and accessible');
  } catch (error) {
    console.log('❌ Server connectivity failed:', error.message);
    return;
  }
  
  // Test basic endpoints
  await testEndpoint('GET', '/buyers');
  
  // Test with a real buyer creation
  const newBuyer = {
    userId: 'test-user-' + Date.now(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    budget: 500000,
    preApproved: true
  };
  
  const createSuccess = await testEndpoint('POST', '/buyers', newBuyer);
  
  // Test preferences endpoint
  await testEndpoint('GET', '/buyers/test-buyer-id/preferences');
  
  // Test saved properties
  await testEndpoint('GET', '/buyers/test-buyer-id/saved-properties');
  
  // Test offers
  await testEndpoint('GET', '/buyers/test-buyer-id/offers');
  
  // Test viewings
  await testEndpoint('GET', '/buyers/test-buyer-id/viewings');
  
  console.log('\n✅ Simple test completed');
}

if (require.main === module) {
  runSimpleTests().catch(console.error);
}

module.exports = { runSimpleTests, testEndpoint };