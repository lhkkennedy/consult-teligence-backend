# Environment Configuration Guide

This guide explains how to set up and switch between different environments (localhost, Render, staging) for mock data generation.

## 🚀 Quick Setup

### 1. Run the Setup Script
```bash
npm run seed:setup
```

This interactive script will help you configure all your environment variables.

### 2. Load Environment Variables
```bash
# Load from .env file
source .env

# Or export them manually
export STRAPI_TOKEN_LOCAL="your_local_token"
export STRAPI_TOKEN_RENDER="your_render_token"
```

### 3. Test Your Configuration
```bash
npm run seed:env
```

This will show all available environments and their token status.

## 🌍 Available Environments

### Local Development (`local`)
- **URL**: `http://localhost:1337/api`
- **Use case**: Development and testing
- **Token**: `STRAPI_TOKEN_LOCAL`
- **Features**: Full logging, data clearing enabled

### Render Production (`render`)
- **URL**: `https://consult-teligence-backend.onrender.com/api`
- **Use case**: Production demos and testing
- **Token**: `STRAPI_TOKEN_RENDER`
- **Features**: Conservative logging, data clearing disabled

### Staging (`staging`)
- **URL**: Configurable via `STRAPI_URL_STAGING`
- **Use case**: Pre-production testing
- **Token**: `STRAPI_TOKEN_STAGING`
- **Features**: Full logging, data clearing enabled

## 🔑 Getting API Tokens

### For Local Development
1. Start your local Strapi application:
   ```bash
   npm run develop
   ```

2. Go to `http://localhost:1337/admin`

3. Log in to your admin panel

4. Navigate to **Settings > API Tokens**

5. Click **Create new API Token**

6. Configure the token:
   - **Name**: `Mock Data Generator - Local`
   - **Description**: `Token for local mock data generation`
   - **Token duration**: `Unlimited`
   - **Token type**: `Full access`

7. Copy the generated token

### For Render Production
1. Go to `https://consult-teligence-backend.onrender.com/admin`

2. Log in to your admin panel

3. Navigate to **Settings > API Tokens**

4. Click **Create new API Token**

5. Configure the token:
   - **Name**: `Mock Data Generator - Production`
   - **Description**: `Token for production mock data generation`
   - **Token duration**: `Unlimited`
   - **Token type**: `Full access`

6. Copy the generated token

⚠️ **Important**: Be careful with production tokens! Only use them when necessary.

## 📝 Environment Variables

### Required Variables
```bash
# Local development
STRAPI_TOKEN_LOCAL=your_local_token_here

# Render production
STRAPI_TOKEN_RENDER=your_render_token_here

# Staging (optional)
STRAPI_TOKEN_STAGING=your_staging_token_here

# Fallback token (used if specific env token not set)
STRAPI_TOKEN=your_fallback_token_here
```

### Optional Variables
```bash
# Override API URL for any environment
STRAPI_URL=https://custom-url.com/api

# Staging URL (if different from default)
STRAPI_URL_STAGING=https://your-staging-url.com/api
```

## 🔄 Switching Environments

### Command Line Usage

#### Basic Commands
```bash
# Generate data for local environment
node scripts/seed-database.js --env=local

# Generate data for Render environment
node scripts/seed-database.js --env=render

# Generate data for staging environment
node scripts/seed-database.js --env=staging
```

#### With NPM Scripts
```bash
# Quick generation for local
npm run seed:quick -- --env=local

# Full generation for Render
npm run seed:full -- --env=render

# Custom generation for staging
npm run seed -- --env=staging --consultants=5 --properties=8
```

#### Advanced Examples
```bash
# Generate minimal data for local testing
node scripts/seed-database.js quick --env=local --no-engagement

# Generate comprehensive data for Render demo
node scripts/seed-database.js full --env=render

# Generate specific amounts for staging
node scripts/seed-database.js --env=staging --consultants=3 --properties=5 --posts=10

# Clear and regenerate for local
node scripts/seed-database.js --env=local --clear
```

### Environment-Specific Behavior

#### Local Environment
- ✅ Data clearing enabled
- ✅ Detailed logging
- ✅ Full engagement data
- ✅ Shorter timeouts
- ✅ Safe for experimentation

#### Render Environment
- ❌ Data clearing disabled (safety)
- ⚠️ Conservative logging
- ✅ Full engagement data
- ✅ Longer timeouts
- ⚠️ Production-safe settings

#### Staging Environment
- ✅ Data clearing enabled
- ✅ Detailed logging
- ✅ Full engagement data
- ✅ Medium timeouts
- ✅ Safe for testing

## 🛠️ Configuration Files

### .env File Example
```bash
# ConsultTeligence Mock Data Generation Environment Variables

# Local Development (localhost:1337)
STRAPI_TOKEN_LOCAL=a4dab8ced2ecd7baa3e8ac5fcef1e0c5ee54525e01a280c7761f5574dc395e656537ef85721709bc805189dba332db4f759e3f6599179ffbe8ce514cc770ec3f486480b600de1657813603ecd71306170d9c84da0eed837dd9dde38243d0dcc580017175353c02b672769ebc477f507c4a5aaab57544c58773de81b44b5e49fc

# Render Production (https://consult-teligence-backend.onrender.com)
STRAPI_TOKEN_RENDER=0aea1420560a5619f3598c4e479191e14ce881f5268f671dbc2e572425159acf20854b693ece04cc8b56b56d066386b5257d05538170135ba42038885ea09c0b8fc4c6cde992302fe2f03ea718b9731194827b990647b66e6af9c1eddb37048149294b0615abef6de29818bcbcff36984478db81158d4c02b4639c2d913e8a2e

# Staging Environment (optional)
STRAPI_TOKEN_STAGING=your_staging_token_here

# Fallback token (used if specific environment token is not set)
STRAPI_TOKEN=your_fallback_token_here

# Optional: Override API URL
# STRAPI_URL=https://custom-url.com/api
```

### Environment Configuration (`scripts/environments.js`)
This file contains the environment definitions and can be customized:

```javascript
const environments = {
  local: {
    name: 'Local Development',
    url: 'http://localhost:1337/api',
    description: 'Local Strapi instance running on localhost:1337',
    token: process.env.STRAPI_TOKEN_LOCAL || process.env.STRAPI_TOKEN,
    timeout: 30000,
    features: {
      clearData: true,
      bulkOperations: true,
      detailedLogging: true
    }
  },
  
  render: {
    name: 'Render Production',
    url: 'https://consult-teligence-backend.onrender.com/api',
    description: 'Hosted Strapi instance on Render',
    token: process.env.STRAPI_TOKEN_RENDER || process.env.STRAPI_TOKEN,
    timeout: 60000,
    features: {
      clearData: false,
      bulkOperations: true,
      detailedLogging: false
    }
  }
};
```

## 🔍 Troubleshooting

### Common Issues

#### "No API token configured for environment"
**Problem**: Environment token not set
**Solution**: 
```bash
# Check your .env file
cat .env

# Or set the token manually
export STRAPI_TOKEN_LOCAL="your_token_here"
```

#### "Environment not found"
**Problem**: Invalid environment name
**Solution**:
```bash
# List available environments
npm run seed:env

# Use correct environment name
node scripts/seed-database.js --env=local  # not --env=localhost
```

#### "Connection timeout"
**Problem**: Network or service issues
**Solution**:
- Check if the service is running
- Verify the URL is correct
- Try increasing timeout in `scripts/environments.js`

#### "Permission denied"
**Problem**: Token doesn't have sufficient permissions
**Solution**:
- Create a new token with "Full access" permissions
- Check if the token is still valid
- Regenerate the token if needed

### Debug Mode
Enable detailed logging by modifying the environment configuration:

```javascript
// In scripts/environments.js
local: {
  // ... other config
  features: {
    clearData: true,
    bulkOperations: true,
    detailedLogging: true  // Enable for debugging
  }
}
```

## 📋 Best Practices

### Security
- ✅ Use different tokens for different environments
- ✅ Never commit tokens to version control
- ✅ Use `.env` file for local development
- ✅ Rotate tokens regularly
- ❌ Don't share tokens publicly

### Development Workflow
1. **Start with local**: Always test locally first
2. **Use staging**: Test on staging before production
3. **Be careful with production**: Use conservative settings
4. **Monitor logs**: Check for errors and warnings

### Token Management
- **Local**: Use unlimited duration tokens
- **Staging**: Use unlimited duration tokens
- **Production**: Consider token expiration for security

## 🎯 Usage Examples

### Development Workflow
```bash
# 1. Set up environments
npm run seed:setup

# 2. Load environment variables
source .env

# 3. Test local environment
npm run seed:quick -- --env=local

# 4. Test Render environment
npm run seed:quick -- --env=render

# 5. Generate full data for demo
npm run seed:full -- --env=render
```

### Production Demo Setup
```bash
# Generate comprehensive data for production demo
npm run seed:full -- --env=render

# Or with custom amounts
node scripts/seed-database.js --env=render --consultants=8 --properties=8 --posts=8
```

### Testing Setup
```bash
# Quick test with minimal data
npm run seed:quick -- --env=local --no-engagement

# Test specific features
node scripts/seed-database.js --env=local --consultants=2 --properties=3 --posts=5
```

## 🎉 Success!

You now have a flexible, secure environment configuration system that allows you to:
- ✅ Easily switch between local and hosted environments
- ✅ Use different tokens for different environments
- ✅ Maintain security best practices
- ✅ Debug issues effectively
- ✅ Scale from development to production

Happy environment switching! 🚀