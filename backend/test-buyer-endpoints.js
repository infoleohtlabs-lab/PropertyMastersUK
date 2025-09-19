const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_PREFIX = '/api';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to log test results
function logTest(testName, success, error = null) {
  if (success) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName}`);
    if (error) {
      const errorMsg = error.message || error.toString();
      console.log(`   Error: ${errorMsg}`);
      testResults.errors.push({ test: testName, error: errorMsg });
    }
    testResults.failed++;
  }
}

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${API_PREFIX}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500
    };
  }
}

// Test server connectivity
async function testServerConnectivity() {
  console.log('\n🔍 Testing Server Connectivity...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    logTest('Server Health Check', true);
    return true;
  } catch (error) {
    // Try alternative endpoints if health endpoint doesn't exist
    try {
      const response = await axios.get(`${BASE_URL}${API_PREFIX}/buyers`, { timeout: 5000 });
      logTest('Server Connectivity (via buyers endpoint)', response.status < 500);
      return response.status < 500;
    } catch (altError) {
      logTest('Server Connectivity', false, altError);
      return false;
    }
  }
}

// Test Buyer Management Endpoints
async function testBuyerManagement() {
  console.log('\n👤 Testing Buyer Management Endpoints...');
  
  // Test GET all buyers
  const getAllResult = await makeRequest('GET', '/buyers');
  logTest('GET /buyers', getAllResult.success);
  
  // Test POST create buyer
  const newBuyer = {
    userId: 'test-user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    budget: 500000,
    preApproved: true
  };
  
  const createResult = await makeRequest('POST', '/buyers', newBuyer);
  logTest('POST /buyers', createResult.success, createResult.success ? null : new Error(JSON.stringify(createResult.error)));
  
  let buyerId = null;
  if (createResult.success && createResult.data && createResult.data.id) {
    buyerId = createResult.data.id;
    
    // Test GET specific buyer
    const getOneResult = await makeRequest('GET', `/buyers/${buyerId}`);
    logTest(`GET /buyers/${buyerId}`, getOneResult.success);
    
    // Test PATCH update buyer
    const updateData = { budget: 600000 };
    const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}`, updateData);
    logTest(`PATCH /buyers/${buyerId}`, updateResult.success);
    
    // Test DELETE buyer
    const deleteResult = await makeRequest('DELETE', `/buyers/${buyerId}`);
    logTest(`DELETE /buyers/${buyerId}`, deleteResult.success);
  }
  
  // Test GET buyer by user ID
  const getByUserResult = await makeRequest('GET', '/buyers/user/test-user-123');
  logTest('GET /buyers/user/:userId', getByUserResult.success || getByUserResult.status === 404);
}

// Test Buyer Preferences Endpoints
async function testBuyerPreferences() {
  console.log('\n⚙️ Testing Buyer Preferences Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET preferences
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/preferences`);
  logTest(`GET /buyers/${buyerId}/preferences`, getResult.success || getResult.status === 404);
  
  // Test POST create preferences
  const preferences = {
    propertyTypes: ['house', 'apartment'],
    minBedrooms: 2,
    maxBedrooms: 4,
    minBathrooms: 1,
    maxPrice: 500000,
    locations: ['London', 'Manchester'],
    features: ['garden', 'parking']
  };
  
  const createResult = await makeRequest('POST', `/buyers/${buyerId}/preferences`, preferences);
  logTest(`POST /buyers/${buyerId}/preferences`, createResult.success);
  
  // Test PATCH update preferences
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/preferences`, { maxPrice: 600000 });
  logTest(`PATCH /buyers/${buyerId}/preferences`, updateResult.success);
  
  // Test DELETE preferences
  const deleteResult = await makeRequest('DELETE', `/buyers/${buyerId}/preferences`);
  logTest(`DELETE /buyers/${buyerId}/preferences`, deleteResult.success);
}

// Test Property Search Endpoints
async function testPropertySearch() {
  console.log('\n🔍 Testing Property Search Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test POST create search
  const searchCriteria = {
    location: 'London',
    minPrice: 200000,
    maxPrice: 500000,
    propertyType: 'house',
    bedrooms: 3
  };
  
  const createResult = await makeRequest('POST', `/buyers/${buyerId}/searches`, searchCriteria);
  logTest(`POST /buyers/${buyerId}/searches`, createResult.success);
  
  // Test GET searches
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/searches`);
  logTest(`GET /buyers/${buyerId}/searches`, getResult.success);
  
  // Test GET saved searches
  const getSavedResult = await makeRequest('GET', `/buyers/${buyerId}/searches/saved`);
  logTest(`GET /buyers/${buyerId}/searches/saved`, getSavedResult.success);
  
  const searchId = 'test-search-id';
  
  // Test PATCH update search
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/searches/${searchId}`, { maxPrice: 600000 });
  logTest(`PATCH /buyers/${buyerId}/searches/${searchId}`, updateResult.success);
  
  // Test POST execute search
  const executeResult = await makeRequest('POST', `/buyers/${buyerId}/searches/${searchId}/execute`);
  logTest(`POST /buyers/${buyerId}/searches/${searchId}/execute`, executeResult.success);
}

// Test Saved Properties Endpoints
async function testSavedProperties() {
  console.log('\n💾 Testing Saved Properties Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET saved properties
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/saved-properties`);
  logTest(`GET /buyers/${buyerId}/saved-properties`, getResult.success);
  
  // Test POST save property
  const saveData = {
    propertyId: 'test-property-123',
    notes: 'Interested in this property'
  };
  
  const saveResult = await makeRequest('POST', `/buyers/${buyerId}/saved-properties`, saveData);
  logTest(`POST /buyers/${buyerId}/saved-properties`, saveResult.success);
  
  const savedPropertyId = 'test-saved-property-id';
  
  // Test PATCH update saved property
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/saved-properties/${savedPropertyId}`, { notes: 'Updated notes' });
  logTest(`PATCH /buyers/${buyerId}/saved-properties/${savedPropertyId}`, updateResult.success);
  
  // Test DELETE saved property
  const deleteResult = await makeRequest('DELETE', `/buyers/${buyerId}/saved-properties/${savedPropertyId}`);
  logTest(`DELETE /buyers/${buyerId}/saved-properties/${savedPropertyId}`, deleteResult.success);
}

// Test Property Offers Endpoints
async function testPropertyOffers() {
  console.log('\n💰 Testing Property Offers Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET offers
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/offers`);
  logTest(`GET /buyers/${buyerId}/offers`, getResult.success);
  
  // Test POST submit offer
  const offerData = {
    propertyId: 'test-property-123',
    amount: 450000,
    conditions: 'Subject to survey',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const submitResult = await makeRequest('POST', `/buyers/${buyerId}/offers`, offerData);
  logTest(`POST /buyers/${buyerId}/offers`, submitResult.success);
  
  const offerId = 'test-offer-id';
  
  // Test PATCH update offer
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/offers/${offerId}`, { amount: 460000 });
  logTest(`PATCH /buyers/${buyerId}/offers/${offerId}`, updateResult.success);
  
  // Test DELETE withdraw offer
  const withdrawResult = await makeRequest('DELETE', `/buyers/${buyerId}/offers/${offerId}`);
  logTest(`DELETE /buyers/${buyerId}/offers/${offerId}`, withdrawResult.success);
}

// Test Mortgage Applications Endpoints
async function testMortgageApplications() {
  console.log('\n🏦 Testing Mortgage Applications Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET applications
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/mortgage-applications`);
  logTest(`GET /buyers/${buyerId}/mortgage-applications`, getResult.success);
  
  // Test POST submit application
  const applicationData = {
    lenderName: 'Test Bank',
    loanAmount: 400000,
    interestRate: 3.5,
    termYears: 25,
    propertyId: 'test-property-123'
  };
  
  const submitResult = await makeRequest('POST', `/buyers/${buyerId}/mortgage-applications`, applicationData);
  logTest(`POST /buyers/${buyerId}/mortgage-applications`, submitResult.success);
  
  const applicationId = 'test-application-id';
  
  // Test PATCH update application
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/mortgage-applications/${applicationId}`, { interestRate: 3.2 });
  logTest(`PATCH /buyers/${buyerId}/mortgage-applications/${applicationId}`, updateResult.success);
  
  // Test GET application status
  const statusResult = await makeRequest('GET', `/buyers/${buyerId}/mortgage-applications/${applicationId}/status`);
  logTest(`GET /buyers/${buyerId}/mortgage-applications/${applicationId}/status`, statusResult.success);
}

// Test Property Viewings Endpoints
async function testPropertyViewings() {
  console.log('\n👁️ Testing Property Viewings Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET viewings
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/viewings`);
  logTest(`GET /buyers/${buyerId}/viewings`, getResult.success);
  
  // Test POST schedule viewing
  const viewingData = {
    propertyId: 'test-property-123',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    notes: 'First viewing'
  };
  
  const scheduleResult = await makeRequest('POST', `/buyers/${buyerId}/viewings`, viewingData);
  logTest(`POST /buyers/${buyerId}/viewings`, scheduleResult.success);
  
  const viewingId = 'test-viewing-id';
  
  // Test PATCH update viewing
  const updateResult = await makeRequest('PATCH', `/buyers/${buyerId}/viewings/${viewingId}`, { notes: 'Updated viewing notes' });
  logTest(`PATCH /buyers/${buyerId}/viewings/${viewingId}`, updateResult.success);
  
  // Test DELETE cancel viewing
  const cancelResult = await makeRequest('DELETE', `/buyers/${buyerId}/viewings/${viewingId}`);
  logTest(`DELETE /buyers/${buyerId}/viewings/${viewingId}`, cancelResult.success);
}

// Test Market Analysis Endpoints
async function testMarketAnalysis() {
  console.log('\n📊 Testing Market Analysis Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET market analysis
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/market-analysis`);
  logTest(`GET /buyers/${buyerId}/market-analysis`, getResult.success);
  
  // Test POST generate market analysis
  const analysisData = {
    location: 'London',
    propertyType: 'house',
    priceRange: { min: 300000, max: 600000 }
  };
  
  const generateResult = await makeRequest('POST', `/buyers/${buyerId}/market-analysis`, analysisData);
  logTest(`POST /buyers/${buyerId}/market-analysis`, generateResult.success);
}

// Test Property Valuations Endpoints
async function testPropertyValuations() {
  console.log('\n💎 Testing Property Valuations Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test POST request valuation
  const valuationData = {
    propertyId: 'test-property-123',
    valuationType: 'market'
  };
  
  const requestResult = await makeRequest('POST', `/buyers/${buyerId}/valuations`, valuationData);
  logTest(`POST /buyers/${buyerId}/valuations`, requestResult.success);
  
  // Test GET valuations
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/valuations`);
  logTest(`GET /buyers/${buyerId}/valuations`, getResult.success);
  
  const propertyId = 'test-property-123';
  
  // Test POST generate AVM
  const avmResult = await makeRequest('POST', `/buyers/${buyerId}/valuations/${propertyId}/avm`);
  logTest(`POST /buyers/${buyerId}/valuations/${propertyId}/avm`, avmResult.success);
}

// Test Financial Assessment Endpoints
async function testFinancialAssessment() {
  console.log('\n💳 Testing Financial Assessment Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET financial assessment
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/financial-assessment`);
  logTest(`GET /buyers/${buyerId}/financial-assessment`, getResult.success);
}

// Test Dashboard Endpoints
async function testDashboard() {
  console.log('\n📈 Testing Dashboard Endpoints...');
  
  const buyerId = 'test-buyer-id';
  
  // Test GET dashboard data
  const getResult = await makeRequest('GET', `/buyers/${buyerId}/dashboard`);
  logTest(`GET /buyers/${buyerId}/dashboard`, getResult.success);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Buyer Endpoints Test Suite');
  console.log('=====================================');
  
  // Test server connectivity first
  const serverRunning = await testServerConnectivity();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running or not accessible. Please ensure the backend server is running on port 3000.');
    return;
  }
  
  // Run all endpoint tests
  await testBuyerManagement();
  await testBuyerPreferences();
  await testPropertySearch();
  await testSavedProperties();
  await testPropertyOffers();
  await testMortgageApplications();
  await testPropertyViewings();
  await testMarketAnalysis();
  await testPropertyValuations();
  await testFinancialAssessment();
  await testDashboard();
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Error Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1) + '%'
    },
    errors: testResults.errors
  };
  
  fs.writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Test results saved to test-results.json');
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testServerConnectivity,
  testBuyerManagement,
  testBuyerPreferences,
  testPropertySearch,
  testSavedProperties,
  testPropertyOffers,
  testMortgageApplications,
  testPropertyViewings,
  testMarketAnalysis,
  testPropertyValuations,
  testFinancialAssessment,
  testDashboard
};