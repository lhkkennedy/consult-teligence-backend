const fetch = require('node-fetch');

async function testRolesEndpoint() {
  const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const token = process.env.STRAPI_TOKEN;

  console.log('Testing roles endpoint...');
  console.log('Base URL:', baseUrl);

  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/users-permissions/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testRolesEndpoint(); 