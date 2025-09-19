const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_PREFIX = '/api';

async function debugBackendServer() {
    console.log('🔍 Backend Server Debug Test');
    console.log('============================\n');
    
    // Test 1: Check if server responds at all
    console.log('1. Testing basic server connectivity...');
    try {
        const response = await axios.get(BASE_URL, { timeout: 5000 });
        console.log(`✅ Server responds on ${BASE_URL}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        console.log(`   Response length: ${response.data.length} characters`);
        
        if (response.headers['content-type']?.includes('text/html')) {
            console.log('   ⚠️  Server returned HTML (likely frontend)');
        }
    } catch (error) {
        console.log(`❌ Server not responding: ${error.message}`);
        return;
    }
    
    // Test 2: Check API health endpoint
    console.log('\n2. Testing API health endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        console.log(`✅ Health endpoint responds`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
    } catch (error) {
        console.log(`❌ Health endpoint failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        }
    }
    
    // Test 3: Check API prefix endpoint
    console.log('\n3. Testing API prefix endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}${API_PREFIX}`, { timeout: 5000 });
        console.log(`✅ API prefix responds`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
    } catch (error) {
        console.log(`❌ API prefix failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        }
    }
    
    // Test 4: Check buyers endpoint with different methods
    console.log('\n4. Testing buyers endpoint...');
    
    // GET request
    try {
        const response = await axios.get(`${BASE_URL}${API_PREFIX}/buyers`, { timeout: 5000 });
        console.log(`✅ GET /api/buyers responds`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-type']?.includes('application/json')) {
            console.log(`   Response:`, response.data);
        } else {
            console.log(`   Response length: ${response.data.length} characters`);
            console.log(`   ⚠️  Not JSON response`);
        }
    } catch (error) {
        console.log(`❌ GET /api/buyers failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Headers:`, error.response.headers);
        }
    }
    
    // POST request
    try {
        const testData = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phone: '+44123456789'
        };
        
        const response = await axios.post(`${BASE_URL}${API_PREFIX}/buyers`, testData, { 
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ POST /api/buyers responds`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
    } catch (error) {
        console.log(`❌ POST /api/buyers failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
            console.log(`   Headers:`, error.response.headers);
        }
    }
    
    // Test 5: Check different ports
    console.log('\n5. Testing different ports...');
    const ports = [3001, 3002, 8000, 8080];
    
    for (const port of ports) {
        try {
            const response = await axios.get(`http://localhost:${port}/health`, { timeout: 2000 });
            console.log(`✅ Port ${port} responds`);
            console.log(`   Status: ${response.status}`);
            if (response.data) {
                console.log(`   Data:`, response.data);
            }
        } catch (error) {
            console.log(`❌ Port ${port} not responding`);
        }
    }
    
    console.log('\n🏁 Debug test completed');
}

// Run the debug test
debugBackendServer().catch(console.error);