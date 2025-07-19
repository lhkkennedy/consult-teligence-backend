# Friend System API Documentation

## Overview
This document describes the API endpoints for the Strapi v5 Friend System implementation. All endpoints require authentication unless otherwise specified.

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Friend Requests

### 1. Create Friend Request
**Endpoint:** `POST /api/friend-requests`

**Request Body:**
```json
{
  "data": {
    "to": 123,
    "status": "pending"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "relationships": {
      "from": {
        "data": {
          "id": 1,
          "type": "user"
        }
      },
      "to": {
        "data": {
          "id": 123,
          "type": "user"
        }
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Cannot send friend request to yourself
- `400 Bad Request` - Friend request already exists
- `400 Bad Request` - Users are already friends

### 2. Update Friend Request Status
**Endpoint:** `PUT /api/friend-requests/:id`

**Request Body:**
```json
{
  "data": {
    "status": "accepted"
  }
}
```

**Response:** Updated friend request object

**Error Responses:**
- `404 Not Found` - Friend request not found
- `403 Forbidden` - Not authorized to update this request

### 3. Get Pending Friend Requests (Received)
**Endpoint:** `GET /api/friend-requests/pending`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "relationships": {
        "from": {
          "data": {
            "id": 1,
            "type": "user",
            "attributes": {
              "username": "john_doe",
              "email": "john@example.com",
              "profileImage": {
                "url": "/uploads/profile.jpg"
              }
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### 4. Get Sent Friend Requests
**Endpoint:** `GET /api/friend-requests/sent`

**Response:** Similar to pending requests but shows requests sent by the current user

## Friends

### 1. Get Friends List
**Endpoint:** `GET /api/friends`

**Response:**
```json
{
  "data": [
    {
      "id": 2,
      "attributes": {
        "username": "jane_doe",
        "email": "jane@example.com",
        "profileImage": {
          "url": "/uploads/jane_profile.jpg"
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### 2. Remove Friend
**Endpoint:** `DELETE /api/friends/:id`

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `404 Not Found` - Friendship not found

### 3. Check Friendship Status
**Endpoint:** `GET /api/friends/status/:userId`

**Response:**
```json
{
  "status": "friends",
  "data": null
}
```

**Possible Status Values:**
- `"friends"` - Users are friends
- `"request_sent"` - Current user sent a friend request
- `"request_received"` - Current user received a friend request
- `"not_friends"` - No friendship or request exists

## Standard Strapi Endpoints

The following standard Strapi endpoints are also available:

### Friend Requests
- `GET /api/friend-requests` - Get all friend requests (with filters)
- `GET /api/friend-requests/:id` - Get specific friend request
- `DELETE /api/friend-requests/:id` - Delete friend request

### Friends
- `GET /api/friends/:id` - Get specific friendship
- `POST /api/friends` - Create friendship (not recommended, use friend requests instead)

## Query Parameters

### Filtering
```
GET /api/friend-requests?filters[status][$eq]=pending
GET /api/friend-requests?filters[to][id][$eq]=123
GET /api/friend-requests?filters[from][id][$eq]=456
```

### Population
```
GET /api/friend-requests?populate[from][populate][0]=profileImage
GET /api/friends?populate[user1][populate][0]=profileImage&populate[user2][populate][0]=profileImage
```

### Pagination
```
GET /api/friend-requests?pagination[page]=1&pagination[pageSize]=10
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Business Rules

1. **Self-Requests**: Users cannot send friend requests to themselves
2. **Duplicate Prevention**: Only one friend request can exist between two users
3. **Friendship Prevention**: Users who are already friends cannot send friend requests
4. **Authorization**: Only the recipient can accept/reject friend requests
5. **Automatic Friendship**: When a friend request is accepted, a friendship is automatically created
6. **Bidirectional Friendships**: Friendships are bidirectional (if A is friends with B, B is friends with A)

## Rate Limiting

Consider implementing rate limiting on friend request creation to prevent spam:
- Maximum 10 friend requests per hour per user
- Maximum 50 friend requests per day per user

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **User Isolation**: Users can only access their own friend requests and friendships
3. **Input Validation**: All input data is validated before processing
4. **SQL Injection Protection**: Strapi's query builder prevents SQL injection
5. **XSS Protection**: Strapi automatically sanitizes input data