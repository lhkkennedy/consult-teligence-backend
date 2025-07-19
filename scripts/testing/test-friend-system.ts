import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:1337';

let authToken: string | null = null;

// Test users data
const testUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User1'
  },
  {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User2'
  }
];

let userIds: string[] = [];

// Create test users
async function createUsers() {
  console.log('Creating test users...');
  
  for (const user of testUsers) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Created user: ${user.username}`);
        userIds.push(data.user.id);
      } else {
        console.error(`Failed to create user ${user.username}:`, data);
      }
    } catch (error: any) {
      console.error(`Error creating user ${user.username}:`, error.message);
    }
  }
}

// Login as a user
async function loginUser(userIndex: number) {
  const user = testUsers[userIndex];
  if (!user) return;

  try {
    const response = await fetch(`${BASE_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: user.email,
        password: user.password
      }),
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.jwt;
      console.log(`Logged in as: ${user.username}`);
    } else {
      console.log(`Failed to login: ${user.username}`, data);
    }
  } catch (error: any) {
    console.error(`Error logging in ${user.username}:`, error.message);
  }
}

// Test sending friend request
async function testSendFriendRequest() {
  if (!authToken || userIds.length < 2) {
    console.log('Need to be logged in and have at least 2 users');
    return;
  }

  console.log('Testing send friend request...');

  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        to: userIds[1],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Friend request sent successfully:', data);
    } else {
      console.log('Failed to send friend request:', data);
    }
  } catch (error: any) {
    console.error('Error creating friend request:', error.message);
  }
}

// Test getting pending requests
async function testGetPendingRequests() {
  if (!authToken) {
    console.log('Need to be logged in');
    return;
  }

  console.log('Testing get pending requests...');

  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Pending requests:', data);
      return data;
    } else {
      console.log('Failed to get pending requests:', data);
    }
  } catch (error: any) {
    console.error('Error getting pending requests:', error.message);
  }
}

// Test getting sent requests
async function testGetSentRequests() {
  if (!authToken) {
    console.log('Need to be logged in');
    return;
  }

  console.log('Testing get sent requests...');

  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/sent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Sent requests:', data);
      return data;
    } else {
      console.log('Failed to get sent requests:', data);
    }
  } catch (error: any) {
    console.error('Error getting sent requests:', error.message);
  }
}

// Test accepting friend request
async function testAcceptFriendRequest(requestId: string) {
  if (!authToken) {
    console.log('Need to be logged in');
    return;
  }

  console.log('Testing accept friend request...');

  try {
    const response = await fetch(`${BASE_URL}/api/friend-requests/${requestId}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Friend request accepted successfully:', data);
    } else {
      console.log('Failed to accept friend request:', data);
    }
  } catch (error: any) {
    console.error('Error accepting friend request:', error.message);
  }
}

// Test getting friends
async function testGetFriends() {
  if (!authToken) {
    console.log('Need to be logged in');
    return;
  }

  console.log('Testing get friends...');

  try {
    const response = await fetch(`${BASE_URL}/api/friends`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Friends:', data);
    } else {
      console.log('Failed to get friends:', data);
    }
  } catch (error: any) {
    console.error('Error getting friends:', error.message);
  }
}

// Test checking friendship status
async function testCheckFriendshipStatus() {
  if (!authToken || userIds.length < 2) {
    console.log('Need to be logged in and have at least 2 users');
    return;
  }

  console.log('Testing check friendship status...');

  try {
    const response = await fetch(`${BASE_URL}/api/friends/status/${userIds[1]}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Friendship status:', data);
    } else {
      console.log('Failed to check friendship status:', data);
    }
  } catch (error: any) {
    console.error('Error checking friendship status:', error.message);
  }
}

// Test removing friend
async function testRemoveFriend() {
  if (!authToken || userIds.length < 2) {
    console.log('Need to be logged in and have at least 2 users');
    return;
  }

  console.log('Testing remove friend...');

  try {
    const response = await fetch(`${BASE_URL}/api/friends/${userIds[1]}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Friend removed successfully:', data);
    } else {
      console.log('Failed to remove friend:', data);
    }
  } catch (error: any) {
    console.error('Error removing friend:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('Starting friend system tests...\n');

  // Create users
  await createUsers();
  console.log('');

  // Login as first user
  await loginUser(0);
  console.log('');

  // Send friend request
  await testSendFriendRequest();
  console.log('');

  // Get sent requests
  await testGetSentRequests();
  console.log('');

  // Login as second user
  await loginUser(1);
  console.log('');

  // Get pending requests
  const pendingRequests = await testGetPendingRequests();
  console.log('');

  // Accept friend request if there is one
  if (pendingRequests && pendingRequests.length > 0) {
    await testAcceptFriendRequest(pendingRequests[0].id);
    console.log('');
  }

  // Get friends
  await testGetFriends();
  console.log('');

  // Check friendship status
  await testCheckFriendshipStatus();
  console.log('');

  // Remove friend
  await testRemoveFriend();
  console.log('');

  console.log('Friend system tests completed!');
}

// Run the tests
runTests().catch(console.error);