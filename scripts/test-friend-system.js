const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:1337';
let authToken = null;

// Test users
const testUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'TestPassword123!'
  },
  {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'TestPassword123!'
  },
  {
    username: 'testuser3',
    email: 'test3@example.com',
    password: 'TestPassword123!'
  }
];

let userIds = [];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const user of testUsers) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      if (data.jwt) {
        userIds.push(data.user.id);
        console.log(`Created user: ${user.username} (ID: ${data.user.id})`);
      } else {
        console.log(`Failed to create user: ${user.username}`, data);
      }
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error.message);
    }
  }
}

async function loginUser(userIndex) {
  const user = testUsers[userIndex];
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: user.email,
        password: user.password
      })
    });
    
    const data = await response.json();
    if (data.jwt) {
      authToken = data.jwt;
      console.log(`Logged in as: ${user.username}`);
      return true;
    } else {
      console.log(`Failed to login: ${user.username}`, data);
      return false;
    }
  } catch (error) {
    console.error(`Error logging in ${user.username}:`, error.message);
    return false;
  }
}

async function testCreateFriendRequest() {
  console.log('\n--- Testing Create Friend Request ---');
  
  if (userIds.length < 2) {
    console.log('Need at least 2 users for this test');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        data: {
          to: userIds[1],
          status: 'pending'
        }
      })
    });
    
    const data = await response.json();
    console.log('Create friend request response:', data);
    
    if (response.ok) {
      console.log('✅ Friend request created successfully');
      return data.data.id;
    } else {
      console.log('❌ Failed to create friend request');
      return null;
    }
  } catch (error) {
    console.error('Error creating friend request:', error.message);
    return null;
  }
}

async function testGetPendingRequests() {
  console.log('\n--- Testing Get Pending Requests ---');
  
  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    console.log('Pending requests response:', data);
    
    if (response.ok) {
      console.log('✅ Retrieved pending requests successfully');
    } else {
      console.log('❌ Failed to retrieve pending requests');
    }
  } catch (error) {
    console.error('Error getting pending requests:', error.message);
  }
}

async function testGetSentRequests() {
  console.log('\n--- Testing Get Sent Requests ---');
  
  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/sent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    console.log('Sent requests response:', data);
    
    if (response.ok) {
      console.log('✅ Retrieved sent requests successfully');
    } else {
      console.log('❌ Failed to retrieve sent requests');
    }
  } catch (error) {
    console.error('Error getting sent requests:', error.message);
  }
}

async function testAcceptFriendRequest(requestId) {
  console.log('\n--- Testing Accept Friend Request ---');
  
  if (!requestId) {
    console.log('No request ID provided');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        data: {
          status: 'accepted'
        }
      })
    });
    
    const data = await response.json();
    console.log('Accept friend request response:', data);
    
    if (response.ok) {
      console.log('✅ Friend request accepted successfully');
    } else {
      console.log('❌ Failed to accept friend request');
    }
  } catch (error) {
    console.error('Error accepting friend request:', error.message);
  }
}

async function testGetFriends() {
  console.log('\n--- Testing Get Friends ---');
  
  try {
    const response = await fetch(`${BASE_URL}/api/friends`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    console.log('Friends response:', data);
    
    if (response.ok) {
      console.log('✅ Retrieved friends successfully');
    } else {
      console.log('❌ Failed to retrieve friends');
    }
  } catch (error) {
    console.error('Error getting friends:', error.message);
  }
}

async function testCheckFriendshipStatus() {
  console.log('\n--- Testing Check Friendship Status ---');
  
  if (userIds.length < 2) {
    console.log('Need at least 2 users for this test');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/friends/status/${userIds[1]}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    console.log('Friendship status response:', data);
    
    if (response.ok) {
      console.log('✅ Retrieved friendship status successfully');
    } else {
      console.log('❌ Failed to retrieve friendship status');
    }
  } catch (error) {
    console.error('Error checking friendship status:', error.message);
  }
}

async function testRemoveFriend() {
  console.log('\n--- Testing Remove Friend ---');
  
  if (userIds.length < 2) {
    console.log('Need at least 2 users for this test');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/friends/${userIds[1]}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    console.log('Remove friend response:', data);
    
    if (response.ok) {
      console.log('✅ Friend removed successfully');
    } else {
      console.log('❌ Failed to remove friend');
    }
  } catch (error) {
    console.error('Error removing friend:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Friend System Tests\n');
  
  // Create test users
  await createTestUsers();
  
  if (userIds.length < 2) {
    console.log('❌ Need at least 2 users to run tests');
    return;
  }
  
  // Login as first user
  const loginSuccess = await loginUser(0);
  if (!loginSuccess) {
    console.log('❌ Failed to login');
    return;
  }
  
  // Test friend request creation
  const requestId = await testCreateFriendRequest();
  
  // Test getting sent requests
  await testGetSentRequests();
  
  // Login as second user to test receiving requests
  await loginUser(1);
  await testGetPendingRequests();
  
  // Accept the friend request
  await testAcceptFriendRequest(requestId);
  
  // Test getting friends
  await testGetFriends();
  
  // Test checking friendship status
  await testCheckFriendshipStatus();
  
  // Test removing friend
  await testRemoveFriend();
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);