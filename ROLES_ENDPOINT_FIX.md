# Roles Endpoint Fix

## Issue
The Strapi users-permissions roles endpoint was throwing an error:
```
Error: Undefined attribute level operator id
```

This error occurred when making requests to `/users-permissions/roles` endpoint.

## Root Cause
The error was caused by the default Strapi users-permissions plugin trying to process a query with an invalid filter structure. The query was attempting to filter by an "id" field with an undefined operator.

## Solution
Created a custom role controller at `src/extensions/users-permissions/controllers/role.ts` that:

1. **Uses direct database queries** instead of the problematic service layer
2. **Handles ID parsing properly** (supports both string and numeric IDs)
3. **Provides proper error handling** with meaningful error messages
4. **Transforms data** to match the expected API response format
5. **Includes proper population** of related permissions and users

## Key Changes

### Controller Implementation
- Uses `strapi.db.query()` instead of `strapi.service()`
- Implements proper error handling with try-catch blocks
- Transforms response data to match API expectations
- Handles both `find` and `findOne` operations

### Error Handling
- Catches and logs errors properly
- Returns appropriate HTTP status codes
- Provides meaningful error messages

### Data Transformation
- Ensures consistent response format
- Handles missing related data gracefully
- Maps database fields to API response structure

## Testing

### Manual Test
You can test the endpoint using the provided test script:

```bash
cd backend
node scripts/test-roles-endpoint.js
```

### API Test
Make a GET request to:
```
GET /users-permissions/roles
```

Expected response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Authenticated",
      "description": "Default role given to authenticated user.",
      "type": "authenticated",
      "permissions": [...],
      "users": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 1,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Deployment
After making these changes:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Restart the server**:
   ```bash
   npm run start
   ```

3. **Test the endpoint** to ensure it's working correctly.

## Notes
- This fix is compatible with Strapi v5.15.0
- The solution maintains backward compatibility
- No database migrations are required
- The fix only affects the roles endpoint, other endpoints remain unchanged 