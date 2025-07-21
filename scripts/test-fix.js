const fetch = require('node-fetch');

async function testUserPermissionsFix() {
  const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const token = process.env.STRAPI_TOKEN;

  console.log('Testing User Permissions Panel Fix...');
  console.log('Base URL:', baseUrl);

  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Test 1: Check if the server is running
    console.log('\n1. Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/_health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
    }

    // Test 2: Test the users-permissions roles endpoint
    console.log('\n2. Testing users-permissions roles endpoint...');
    const rolesResponse = await fetch(`${baseUrl}/users-permissions/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    console.log('Roles endpoint status:', rolesResponse.status);
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Roles endpoint working correctly');
      console.log('Number of roles found:', rolesData.data?.length || 0);
    } else {
      const errorText = await rolesResponse.text();
      console.error('❌ Roles endpoint error:', errorText);
    }

    // Test 3: Test individual role endpoint
    console.log('\n3. Testing individual role endpoint...');
    const roleResponse = await fetch(`${baseUrl}/users-permissions/roles/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    console.log('Individual role status:', roleResponse.status);
    if (roleResponse.ok) {
      console.log('✅ Individual role endpoint working correctly');
    } else {
      const errorText = await roleResponse.text();
      console.error('❌ Individual role endpoint error:', errorText);
    }

    // Test 4: Test admin roles endpoint (if accessible)
    console.log('\n4. Testing admin roles endpoint...');
    const adminRolesResponse = await fetch(`${baseUrl}/admin/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    console.log('Admin roles status:', adminRolesResponse.status);
    if (adminRolesResponse.ok) {
      console.log('✅ Admin roles endpoint working correctly');
    } else {
      console.log('⚠️ Admin roles endpoint not accessible (this is normal for non-admin users)');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserPermissionsFix(); 