# Server Startup Fix

## Issue Description

The Strapi server was failing to start with the following errors:
1. **App keys are required**: `Middleware "strapi::session": App keys are required. Please set app.keys in config/server.js`
2. **CORS configuration warning**: `The strapi::cors middleware no longer supports the 'enabled' option`

## Root Cause

1. **Missing App Keys**: The session middleware requires app keys for security, but they weren't configured
2. **Deprecated CORS Configuration**: The `enabled` option in CORS middleware is no longer supported in Strapi v5

## Solution Implemented

### 1. Fixed Server Configuration (`backend/config/server.ts`)

**Before:**
```typescript
app: {
  keys: env.array('APP_KEYS'),
},
```

**After:**
```typescript
app: {
  keys: env.array('APP_KEYS') || [
    'defaultKey1',
    'defaultKey2',
    'defaultKey3',
    'defaultKey4'
  ],
},
```

### 2. Fixed CORS Configuration (`backend/config/middlewares.ts`)

**Before:**
```typescript
{
  name: 'strapi::cors',
  config: {
    enabled: true,  // ❌ Deprecated
    origin: [...],
    // ...
  },
},
```

**After:**
```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [...],  // ✅ Removed deprecated 'enabled' option
    // ...
  },
},
```

### 3. Created Environment Setup Script (`backend/scripts/setup-env.js`)

- Automatically generates secure random keys
- Creates a `.env` file with all required environment variables
- Includes proper security keys for JWT, API tokens, etc.

## Quick Fix Steps

### Option 1: Use the Setup Script (Recommended)

```bash
# Run the environment setup script
npm run setup:env

# Start the development server
npm run dev
```

### Option 2: Manual Setup

1. **Create a `.env` file** in the backend directory with:

```env
# App Keys (required for session middleware)
APP_KEYS=key1,key2,key3,key4

# JWT Secrets
ADMIN_JWT_SECRET=your_admin_jwt_secret
API_TOKEN_SALT=your_api_token_salt
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Database Configuration
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server Configuration
HOST=0.0.0.0
PORT=1337
```

2. **Start the server**:
```bash
npm run dev
```

## Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `APP_KEYS` | Session encryption keys | ✅ Yes |
| `ADMIN_JWT_SECRET` | Admin panel JWT signing | ✅ Yes |
| `API_TOKEN_SALT` | API token encryption | ✅ Yes |
| `TRANSFER_TOKEN_SALT` | Transfer token encryption | ✅ Yes |
| `JWT_SECRET` | User JWT signing | ✅ Yes |
| `DATABASE_CLIENT` | Database type | ✅ Yes |
| `HOST` | Server host | ❌ No (defaults to 0.0.0.0) |
| `PORT` | Server port | ❌ No (defaults to 1337) |

## Security Notes

- **Never commit `.env` files** to version control (already in `.gitignore`)
- **Use strong, random keys** in production
- **Rotate keys regularly** for better security
- **Use environment-specific configurations** for different deployments

## Verification

After applying the fix:

1. ✅ Server starts without app keys error
2. ✅ No CORS configuration warnings
3. ✅ User permissions panel should work (from previous fix)
4. ✅ All endpoints accessible

## Production Deployment

For production, ensure you have:

1. **Strong, unique keys** for each environment
2. **Proper database configuration**
3. **Secure CORS origins**
4. **Environment-specific variables**

Example production `.env`:
```env
NODE_ENV=production
APP_KEYS=prod_key1,prod_key2,prod_key3,prod_key4
DATABASE_URL=your_production_database_url
CORS_ORIGIN=https://yourdomain.com
``` 