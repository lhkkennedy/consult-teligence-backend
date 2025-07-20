#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

// Test local Strapi connection
async function testLocalConnection() {
  console.log('🔍 Testing Local Strapi Connection');
  console.log('==================================\n');
  
  const localUrl = 'http://localhost:1337/api';
  const token = process.env.STRAPI_TOKEN_LOCAL || process.env.TOKEN || process.env.STRAPI_TOKEN;
  
  console.log(`📡 API URL: ${localUrl}`);
  console.log(`🔑 Token: ${token ? '✅ Configured' : '❌ Missing'}`);
  
  if (!token) {
    console.log('\n❌ No API token found!');
    console.log('\n💡 To fix this:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Log in to your admin panel');
    console.log('3. Go to Settings > API Tokens');
    console.log('4. Create a new token with "Full access" permissions');
    console.log('5. Set the token in your .env file:');
    console.log('   STRAPI_TOKEN_LOCAL=your_token_here');
    return;
  }
  
  try {
    console.log('\n🧪 Testing API connection...');
    
    // Test basic API endpoint
    const response = await axios.get(`${localUrl}/consultants`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Connection successful!');
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📋 Data count: ${response.data.data?.length || 0} consultants`);
    
    // Test creating a simple consultant
    console.log('\n🧪 Testing consultant creation...');
    
    const testConsultant = {
      data: {
        firstName: 'Test',
        lastName: 'User',
        location: 'Test Location',
        company: 'Test Company',
        currentRole: 'Test Role',
        functionalExpertise: ['Testing'],
        geographicalExpertise: 'North America',
        countryExpertise: 'United States',
        rate: 100.00,
        bio: 'Test bio',
        education: 'Test education',
        certifications: [],
        languages: ['English'],
        profileImage: null,
        contactInfo: {
          email: 'test@example.com',
          phone: '+1-555-0000',
          linkedin: 'https://linkedin.com/in/test'
        },
        availability: 'Available',
        testimonials: [],
        caseStudies: [],
        total_gfa: 1000000,
        total_aum: 100000000,
        deal_count: 10,
        avg_deal_size: 10000000
      }
    };
    
    const createResponse = await axios.post(`${localUrl}/consultants`, testConsultant, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Consultant creation successful!');
    console.log(`📝 Created consultant ID: ${createResponse.data.data.id}`);
    
    // Clean up - delete the test consultant
    console.log('\n🧹 Cleaning up test data...');
    await axios.delete(`${localUrl}/consultants/${createResponse.data.data.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Your local Strapi is ready for seeding.');
    
  } catch (error) {
    console.log('\n❌ Connection failed!');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error?.message || 'Unknown error'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 This looks like an authentication issue.');
        console.log('   Make sure your API token has the correct permissions.');
        console.log('   Try creating a new token with "Full access" permissions.');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Make sure your Strapi server is running:');
      console.log('   npm run develop');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the test
if (require.main === module) {
  testLocalConnection().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testLocalConnection }; 