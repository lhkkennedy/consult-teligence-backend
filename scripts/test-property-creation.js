const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

async function testPropertyCreation() {
  console.log('Testing property creation...');
  
  const testProperty = {
    property_uid: 'TEST-001',
    title: 'Test Property',
    address: '123 Test Street, Test City, TC 12345',
    property_type: 'Office',
    status: 'Stabilised',
    headline_metric: '5.0% Cap Rate',
    media_urls: [],
    roles: ['Test'],
    deal_size: 1000000,
    irr: 5.0,
    completion_percentage: 100,
    tags: ['Test']
  };
  
  try {
    console.log('Creating test property...');
    const response = await axios.post(`${API_BASE_URL}/properties`, {
      data: testProperty
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test property created successfully:', response.data);
  } catch (error) {
    console.error('❌ Failed to create test property:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Message: ${error.message}`);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPropertyCreation().catch(console.error); 