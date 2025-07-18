# Strapi v5 Friend System Implementation

## 🎯 Overview
A complete professional networking friend system for Strapi v5 CMS that allows users to send friend requests, accept/reject requests, manage their professional network, and view their connections.

## ✨ Features

### Core Functionality
- ✅ Send friend requests to other users
- ✅ Accept or reject incoming friend requests
- ✅ View pending friend requests (received)
- ✅ View sent friend requests
- ✅ View friends list
- ✅ Remove friends from network
- ✅ Check friendship status with any user

### Security & Validation
- ✅ Authentication required for all endpoints
- ✅ Prevent self-friend requests
- ✅ Prevent duplicate friend requests
- ✅ Prevent requests between existing friends
- ✅ Authorization checks (only recipients can accept/reject)
- ✅ Input validation and sanitization

### Business Logic
- ✅ Automatic friendship creation on request acceptance
- ✅ Bidirectional friendships (if A is friends with B, B is friends with A)
- ✅ Proper error handling and user feedback
- ✅ Rate limiting considerations

## 🏗️ Architecture

### Database Schema
```
friend_requests
├── id (Primary Key)
├── from (Relation to User)
├── to (Relation to User)
├── status (enum: pending, accepted, rejected)
├── createdAt
└── updatedAt

friends
├── id (Primary Key)
├── user1 (Relation to User)
├── user2 (Relation to User)
└── createdAt

users (Extended)
├── ...existing fields
├── sentFriendRequests (One-to-Many)
└── receivedFriendRequests (One-to-Many)
```

### API Endpoints

#### Friend Requests
- `POST /api/friend-requests` - Create friend request
- `PUT /api/friend-requests/:id` - Update request status
- `GET /api/friend-requests/pending` - Get pending requests (received)
- `GET /api/friend-requests/sent` - Get sent requests
- `GET /api/friend-requests` - Get all requests (with filters)
- `DELETE /api/friend-requests/:id` - Delete request

#### Friends
- `GET /api/friends` - Get friends list
- `DELETE /api/friends/:id` - Remove friend
- `GET /api/friends/status/:userId` - Check friendship status

## 📁 File Structure

```
src/
├── api/
│   ├── friend-request/
│   │   ├── content-types/friend-request/schema.json
│   │   ├── controllers/friend-request.js
│   │   ├── routes/friend-request.js
│   │   └── services/friend-request.js
│   └── friends/
│       ├── content-types/friends/schema.json
│       ├── controllers/friends.js
│       ├── routes/friends.js
│       └── services/friends.js
├── extensions/
│   └── users-permissions/content-types/user/schema.json
└── policies/
    └── isAuthenticated.js

scripts/
└── test-friend-system.js

docs/
├── FRIEND_SYSTEM_API.md
├── FRIEND_SYSTEM_IMPLEMENTATION_GUIDE.md
└── FRIEND_SYSTEM_README.md
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run develop
```

### 3. Configure Permissions
1. Go to Strapi Admin Panel
2. Settings → Users & Permissions Plugin → Roles
3. Configure "Authenticated" role permissions for Friend Request and Friends

### 4. Test the Implementation
```bash
node scripts/test-friend-system.js
```

## 🔧 Configuration

### Permissions Setup
- **Friend Request**: Create, Read (own), Update (own received), Delete (disabled)
- **Friends**: Read (own), Create (disabled), Update (disabled), Delete (own)

### Environment Variables
```bash
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_friends
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
```

## 📚 API Documentation

### Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Example Usage

#### Send Friend Request
```bash
curl -X POST http://localhost:1337/api/friend-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"data": {"to": 2, "status": "pending"}}'
```

#### Accept Friend Request
```bash
curl -X PUT http://localhost:1337/api/friend-requests/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"data": {"status": "accepted"}}'
```

#### Get Friends List
```bash
curl -X GET http://localhost:1337/api/friends \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 Testing

### Automated Tests
The included test script validates:
- User creation and authentication
- Friend request creation
- Request acceptance/rejection
- Friends list retrieval
- Friendship removal
- Error handling

### Manual Testing
Use the provided cURL commands or integrate with your frontend application.

## 🔒 Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own data
- **Input Validation**: Comprehensive validation on all inputs
- **Authorization**: Proper permission checks for all operations
- **SQL Injection Protection**: Strapi's query builder prevents attacks
- **XSS Protection**: Automatic input sanitization

## 📈 Performance Considerations

### Database Optimization
- Consider adding indexes on frequently queried fields
- Implement pagination for large friend lists
- Use proper population strategies

### Caching
- Cache frequently accessed friend lists
- Implement Redis for session management
- Use CDN for profile images

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check JWT token validity
   - Verify user permissions in Strapi admin
   - Ensure proper role assignment

2. **Database Errors**
   - Run `npm run strapi develop` to create tables
   - Check database connection
   - Verify schema migrations

3. **Circular Dependencies**
   - Ensure proper plugin loading order
   - Check User model extensions

### Debug Mode
Enable debug logging in `config/server.js`:
```javascript
logger: {
  level: 'debug'
}
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow security best practices

## 📄 License

This implementation follows the same license as your Strapi project.

## 🆘 Support

For issues or questions:
1. Check the implementation guide
2. Review error logs
3. Test with provided scripts
4. Consult Strapi documentation

## 🔄 Version History

- **v1.0.0** - Initial implementation
  - Complete friend request system
  - Friends management
  - Custom controllers and services
  - Comprehensive testing
  - Full documentation