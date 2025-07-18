# Friend System Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing and testing the Strapi v5 Friend System.

## Prerequisites
- Strapi v5 application running
- Node.js 18+ 
- Database (SQLite, PostgreSQL, MySQL, etc.)

## Implementation Steps

### 1. Database Migration
After creating the collection types, you'll need to run a database migration:

```bash
npm run strapi develop
```

This will automatically create the necessary database tables and relations.

### 2. Configure Permissions

#### Friend Request Permissions
1. Go to Settings → Users & Permissions Plugin → Roles
2. Select "Authenticated" role
3. Configure Friend Request permissions:
   - ✅ Create
   - ✅ Read (own requests)
   - ✅ Update (own received requests)
   - ❌ Delete

#### Friends Permissions
1. In the same "Authenticated" role
2. Configure Friends permissions:
   - ✅ Read (own friends)
   - ❌ Create
   - ❌ Update
   - ✅ Delete (own friendships)

### 3. Test the Implementation

#### Start the Development Server
```bash
npm run develop
```

#### Run the Test Script
```bash
node scripts/test-friend-system.js
```

The test script will:
1. Create test users
2. Test friend request creation
3. Test request acceptance
4. Test friends list retrieval
5. Test friendship removal

### 4. API Testing with cURL

#### Create a Friend Request
```bash
curl -X POST http://localhost:1337/api/friend-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "to": 2,
      "status": "pending"
    }
  }'
```

#### Get Pending Requests
```bash
curl -X GET http://localhost:1337/api/friend-requests/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Accept Friend Request
```bash
curl -X PUT http://localhost:1337/api/friend-requests/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "status": "accepted"
    }
  }'
```

#### Get Friends List
```bash
curl -X GET http://localhost:1337/api/friends \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Check Friendship Status
```bash
curl -X GET http://localhost:1337/api/friends/status/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Remove Friend
```bash
curl -X DELETE http://localhost:1337/api/friends/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### React Example

```jsx
import React, { useState, useEffect } from 'react';

const FriendSystem = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  const token = localStorage.getItem('jwt');
  
  // Get friends list
  const getFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFriends(data.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };
  
  // Send friend request
  const sendFriendRequest = async (userId) => {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            to: userId,
            status: 'pending'
          }
        })
      });
      
      if (response.ok) {
        console.log('Friend request sent successfully');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };
  
  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            status: 'accepted'
          }
        })
      });
      
      if (response.ok) {
        console.log('Friend request accepted');
        // Refresh pending requests
        getPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  // Get pending requests
  const getPendingRequests = async () => {
    try {
      const response = await fetch('/api/friend-requests/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPendingRequests(data.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };
  
  useEffect(() => {
    getFriends();
    getPendingRequests();
  }, []);
  
  return (
    <div>
      <h2>Friends ({friends.length})</h2>
      <div>
        {friends.map(friend => (
          <div key={friend.id}>
            <span>{friend.attributes.username}</span>
            <button onClick={() => removeFriend(friend.id)}>Remove</button>
          </div>
        ))}
      </div>
      
      <h2>Pending Requests ({pendingRequests.length})</h2>
      <div>
        {pendingRequests.map(request => (
          <div key={request.id}>
            <span>{request.relationships.from.data.attributes.username}</span>
            <button onClick={() => acceptFriendRequest(request.id)}>Accept</button>
            <button onClick={() => rejectFriendRequest(request.id)}>Reject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSystem;
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
- "Cannot send friend request to yourself"
- "Friend request already exists"
- "Users are already friends"

#### 401 Unauthorized
- "Authentication required"

#### 403 Forbidden
- "Not authorized to update this request"

#### 404 Not Found
- "Friend request not found"
- "Friendship not found"

### Error Handling in Frontend

```javascript
const handleApiError = (response, errorMessage) => {
  if (!response.ok) {
    switch (response.status) {
      case 400:
        console.error('Bad Request:', errorMessage);
        break;
      case 401:
        console.error('Authentication required');
        // Redirect to login
        break;
      case 403:
        console.error('Forbidden');
        break;
      case 404:
        console.error('Not found');
        break;
      default:
        console.error('Server error');
    }
  }
};
```

## Security Considerations

### 1. Rate Limiting
Consider implementing rate limiting middleware:

```javascript
// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### 2. Input Validation
The system includes built-in validation:
- User IDs must be valid integers
- Status must be one of: 'pending', 'accepted', 'rejected'
- Users cannot send requests to themselves

### 3. Authorization
- Users can only manage their own friend requests and friendships
- Only recipients can accept/reject friend requests
- Users can only remove their own friendships

## Performance Optimization

### 1. Database Indexes
Consider adding database indexes for better performance:

```sql
-- For friend_requests table
CREATE INDEX idx_friend_requests_from ON friend_requests(from);
CREATE INDEX idx_friend_requests_to ON friend_requests(to);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

-- For friends table
CREATE INDEX idx_friends_user1 ON friends(user1);
CREATE INDEX idx_friends_user2 ON friends(user2);
```

### 2. Pagination
For large friend lists, implement pagination:

```javascript
// In the controller
const { page = 1, pageSize = 10 } = ctx.query;

const friends = await strapi.entityService.findMany('api::friends.friends', {
  filters: {
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  },
  populate: {
    user1: {
      populate: ['profileImage']
    },
    user2: {
      populate: ['profileImage']
    }
  },
  pagination: {
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  }
});
```

## Monitoring and Logging

### 1. Add Logging
```javascript
// In controllers
strapi.log.info(`Friend request created from user ${userId} to user ${data.to}`);
strapi.log.info(`Friendship created between users ${userId1} and ${userId2}`);
```

### 2. Metrics
Consider tracking:
- Number of friend requests sent per day
- Friend request acceptance rate
- Most active users in the friend system

## Troubleshooting

### Common Issues

#### 1. Permission Denied
- Check if the user is authenticated
- Verify the user has the correct permissions
- Ensure the JWT token is valid

#### 2. Database Errors
- Check if the database tables exist
- Verify the relations are properly set up
- Check for foreign key constraints

#### 3. Circular Dependencies
- Ensure the User model extensions are loaded correctly
- Check the order of plugin loading

### Debug Mode
Enable debug mode for detailed error messages:

```javascript
// config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  logger: {
    level: 'debug'
  }
});
```

## Deployment

### 1. Production Build
```bash
npm run build
npm run start
```

### 2. Environment Variables
Set the following environment variables:
```bash
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
```

### 3. Database Migration
Ensure the database schema is up to date:
```bash
npm run strapi database:migrate
```

## Support

For issues or questions:
1. Check the Strapi documentation
2. Review the error logs
3. Test with the provided test script
4. Verify the implementation against the specification