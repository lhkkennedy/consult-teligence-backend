# Environment Setup Guide

## Database Connection Issues

The database migration script is failing due to authentication issues. This guide will help you set up the correct environment variables.

## Option 1: Using Individual Database Parameters (Recommended)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DATABASE_HOST=your_database_host
DATABASE_PORT=5432
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password
DATABASE_SSL=false

# Example for local development:
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_NAME=strapi
# DATABASE_USERNAME=postgres
# DATABASE_PASSWORD=your_password
# DATABASE_SSL=false

# Example for production (e.g., Render, Heroku):
# DATABASE_HOST=your-production-host.com
# DATABASE_PORT=5432
# DATABASE_NAME=your_production_db
# DATABASE_USERNAME=your_production_user
# DATABASE_PASSWORD=your_production_password
# DATABASE_SSL=true
```

Then run the alternative script:
```bash
node scripts/fix-database-issues-alternative.js
```

## Option 2: Using Connection String

If you prefer to use a connection string, create a `.env` file with:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_SSL=false

# Example:
# DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/strapi
# DATABASE_SSL=false
```

Then run the original script:
```bash
node scripts/fix-database-issues.js
```

## Common Issues and Solutions

### 1. SASL Authentication Error
**Error**: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

**Solution**: 
- Ensure your password is properly quoted in the .env file
- Check that there are no extra spaces or special characters
- Try using individual parameters instead of connection string

### 2. Connection Refused
**Error**: `ECONNREFUSED`

**Solution**:
- Verify the database host and port are correct
- Ensure the database server is running
- Check firewall settings

### 3. Authentication Failed
**Error**: `password authentication failed`

**Solution**:
- Verify username and password are correct
- Check if the user has the necessary permissions
- Ensure the database exists

### 4. SSL Connection Issues
**Error**: `SSL connection required`

**Solution**:
- Set `DATABASE_SSL=true` for production databases
- For local development, usually `DATABASE_SSL=false`

## Finding Your Database Credentials

### Local Development
If you're using a local PostgreSQL installation:
1. Check your PostgreSQL configuration
2. Look for connection details in your Strapi configuration
3. Check if you have a `.env` file from your original setup

### Production (Render, Heroku, etc.)
1. Check your hosting platform's dashboard
2. Look for database connection details
3. Copy the connection string or individual parameters

### Strapi Configuration
Check your existing Strapi configuration files:
- `config/database.ts`
- `config/environments/`
- Any existing `.env` files

## Testing the Connection

You can test your database connection with a simple script:

```javascript
// test-connection.js
const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
```

Run it with:
```bash
node test-connection.js
```

## Next Steps

Once you have the correct environment variables:

1. Create the `.env` file with your database credentials
2. Run the database migration script
3. Restart your Strapi application
4. Verify that the warnings are gone 