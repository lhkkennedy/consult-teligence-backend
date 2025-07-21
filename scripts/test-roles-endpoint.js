const fetch = require('node-fetch');

async function testRolesEndpoint() {
  const baseUrl = process.env.STRAPI_URL || 'http://localhost:1338';
  const endpoint = `${baseUrl}/api/users-permissions/roles`;
  
  console.log('=== TESTING ROLES ENDPOINT ===');
  console.log('Endpoint:', endpoint);
  console.log('Time:', new Date().toISOString());
  
  try {
    console.log('\nMaking GET request...');
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS: Roles endpoint is working!');
        console.log('Number of roles:', data.data?.length || 0);
      } catch (parseError) {
        console.log('⚠️  Could not parse response as JSON');
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error making request:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the test
testRolesEndpoint().catch(console.error); 