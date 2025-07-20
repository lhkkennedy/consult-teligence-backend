# Fresh PostgreSQL Database Setup Guide

## Overview
This guide will help you set up a fresh PostgreSQL database on Render to avoid the JSON column migration issues.

## Step 1: Create New PostgreSQL Database on Render

1. **Go to your Render Dashboard**
   - Navigate to [dashboard.render.com](https://dashboard.render.com)
   - Sign in to your account

2. **Create New PostgreSQL Service**
   - Click "New +" button
   - Select "PostgreSQL" from the services list
   - Choose "PostgreSQL" as the service type

3. **Configure Database**
   - **Name**: `consult-teligence-db` (or your preferred name)
   - **Database**: `consultteligence` (or your preferred database name)
   - **User**: `consultteligence_user` (or your preferred username)
   - **Region**: Choose the same region as your backend service
   - **PostgreSQL Version**: Latest stable version (14 or 15)
   - **Plan**: Start with "Free" for development, upgrade as needed

4. **Create the Database**
   - Click "Create Database"
   - Wait for the database to be provisioned (usually 1-2 minutes)

## Step 2: Get Database Connection Details

1. **Copy Connection Details**
   - Once created, click on your new database service
   - Go to the "Connections" tab
   - Copy the "External Database URL" (it looks like: `postgresql://user:password@host:port/database`)

2. **Note the Credentials**
   - Save the username, password, and database name
   - You'll need these for environment variables

## Step 3: Update Environment Variables

1. **Go to Your Backend Service**
   - Navigate to your Strapi backend service on Render
   - Go to "Environment" tab

2. **Update Database Variables**
   - **DATABASE_CLIENT**: `postgres`
   - **DATABASE_URL**: Paste the external database URL from Step 2
   - **DATABASE_HOST**: Extract from the URL (usually something like `dpg-xxx-a.oregon-postgres.render.com`)
   - **DATABASE_PORT**: `5432`
   - **DATABASE_NAME**: Your database name (e.g., `consultteligence`)
   - **DATABASE_USERNAME**: Your database username (e.g., `consultteligence_user`)
   - **DATABASE_PASSWORD**: Your database password
   - **DATABASE_SSL**: `true`

3. **Save Environment Variables**
   - Click "Save Changes"

## Step 4: Deploy Your Application

1. **Trigger New Deployment**
   - Go to your backend service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to trigger automatic deployment

2. **Monitor Deployment**
   - Watch the build logs
   - The deployment should now succeed without migration errors
   - Strapi will create the schema cleanly from your content-type definitions

## Step 5: Seed Your Database

1. **Run Your Seeding Script**
   ```bash
   # If you have a seeding script, run it after deployment
   npm run seed
   ```

2. **Verify Data**
   - Check your Strapi admin panel
   - Verify that your content types are created correctly
   - Confirm that seeded data appears as expected

## Step 6: Update Frontend (if needed)

1. **Check Frontend Configuration**
   - Ensure your frontend is pointing to the correct backend URL
   - Update any environment variables if needed

2. **Test the Application**
   - Verify that your frontend can connect to the backend
   - Test key functionality

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check that DATABASE_SSL is set to `true`
   - Verify the database URL is correct
   - Ensure the database is in the same region as your backend

2. **Permission Denied**
   - Verify the username and password are correct
   - Check that the user has proper permissions

3. **Database Not Found**
   - Confirm the database name matches exactly
   - Check that the database was created successfully

### Useful Commands:

```bash
# Test database connection locally (if needed)
psql "postgresql://user:password@host:port/database"

# Check database status on Render
# Go to your database service dashboard
```

## Benefits of Fresh Database

✅ **No Migration Issues**: Clean schema from the start
✅ **Better Performance**: No legacy data or corrupted records
✅ **Easier Debugging**: No complex migration logic to maintain
✅ **Future-Proof**: Starts with correct data types and constraints
✅ **Simpler Deployment**: No pre-deployment database fixes needed

## Next Steps

After successful deployment:
1. **Backup Strategy**: Set up regular database backups
2. **Monitoring**: Configure database monitoring and alerts
3. **Scaling**: Plan for database scaling as your application grows 