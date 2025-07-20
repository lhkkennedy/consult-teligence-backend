# Database Seeding Guide

This guide will help you set up and run the database seeding script to populate your ConsultTeligence Strapi instance with mock data.

## Prerequisites

1. **Strapi Instance Running**: Make sure your Strapi backend is running
2. **API Token**: You need an API token with appropriate permissions
3. **Node.js**: Ensure you have Node.js installed

## Quick Start

### 1. Set Up Environment Variables

First, you need to configure your API tokens. You have several options:

#### Option A: Interactive Setup (Recommended)
```bash
cd backend
node scripts/setup-environments.js setup
```

This will guide you through setting up tokens for different environments.

#### Option B: Manual Setup
```bash
cd backend
node scripts/setup-environments.js create
```

This creates a `.env` file template. Edit it and add your actual tokens.

#### Option C: Environment Variables
Set the tokens directly in your shell:
```bash
export STRAPI_TOKEN_LOCAL="your_token_here"
export STRAPI_TOKEN="your_fallback_token_here"
```

### 2. Get Your API Token

To get an API token from Strapi:

1. Go to your Strapi admin panel (e.g., `http://localhost:1337/admin`)
2. Navigate to **Settings** > **API Tokens**
3. Click **Create new API Token**
4. Give it a name (e.g., "Mock Data Generator")
5. Set permissions to **Full access** (or appropriate permissions)
6. Copy the generated token

### 3. Run the Seeding Script

#### Quick Test (Minimal Data)
```bash
npm run seed:quick --env=local
```

#### Full Data Set
```bash
npm run seed:full --env=local
```

#### Custom Configuration
```bash
# Generate only 3 consultants and 5 properties
npm run seed:generate -- --consultants=3 --properties=5 --env=local

# Skip engagement data (reactions, comments, etc.)
npm run seed:generate -- --no-engagement --env=local
```

## Available Commands

### Basic Commands
- `npm run seed:quick` - Generate minimal data for testing
- `npm run seed:full` - Generate comprehensive data set
- `npm run seed:generate` - Generate with custom options

### Advanced Options
- `--consultants=N` - Number of consultants to create
- `--properties=N` - Number of properties to create  
- `--posts=N` - Number of posts to create
- `--no-engagement` - Skip reactions, comments, saves, views
- `--clear` - Clear existing data before generation
- `--env=ENV` - Specify environment (local, render, staging)

### Environment Management
- `npm run seed:env` - List available environments
- `node scripts/setup-environments.js list` - Show environment details

## Troubleshooting

### Common Issues

#### 1. "Missing or invalid credentials" (401 Error)
**Cause**: No API token configured or invalid token
**Solution**: 
- Set up your API token using the setup script
- Verify the token has correct permissions
- Check that your Strapi instance is running

#### 2. "Invalid key description" (400 Error)
**Cause**: Data structure doesn't match schema
**Solution**: This has been fixed in the latest version. Update your script if you're using an older version.

#### 3. "Cannot read properties of undefined" (500 Error)
**Cause**: Dependencies between entities not created properly
**Solution**: This usually happens when consultants fail to create due to auth issues. Fix the authentication first.

#### 4. Environment Not Found
**Cause**: Environment not configured
**Solution**: 
```bash
node scripts/setup-environments.js list
node scripts/setup-environments.js setup
```

### Debug Mode

To see more detailed output, you can modify the config:

```javascript
// In scripts/mock-data-config.js
output: {
  logLevel: 'debug',
  showProgress: true
}
```

### Manual Testing

Test your API connection manually:

```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:1337/api/consultants
```

## Data Generated

The seeding script creates:

### Consultants
- Professional profiles with expertise areas
- Contact information and availability
- Portfolio statistics (GFA, AUM, deal counts)
- Certifications and languages

### Properties
- Real estate listings with detailed information
- Property types (Office, Industrial, Residential, Retail)
- Status tracking (Planning, Under Construction, Stabilised, Exited)
- Financial metrics (deal size, IRR, completion percentage)

### Posts
- Various post types (NewListing, ProgressUpdate, Insight, Closing, Property)
- Sentiment analysis (Bull, Bear, Neutral)
- Tags and categorization

### Engagement Data
- Reactions (likes, loves, celebrates, insightful)
- Comments on posts
- Save/bookmark actions
- View tracking with duration

## Configuration

### Customizing Data Generation

Edit `scripts/mock-data-config.js` to customize:

- Number of items to generate
- Engagement probabilities
- Content types and tags
- Validation rules
- Output settings

### Environment-Specific Settings

Different environments have different configurations:

- **Local**: Full features, detailed logging
- **Render**: Conservative settings, limited logging
- **Staging**: Testing-focused settings

## Best Practices

1. **Start Small**: Use `seed:quick` for initial testing
2. **Test Locally**: Always test on local environment first
3. **Backup Data**: Consider backing up existing data before clearing
4. **Monitor Logs**: Watch for errors and adjust configuration
5. **Incremental Testing**: Test each content type separately if needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Strapi instance is running and accessible
3. Ensure your API token has correct permissions
4. Check the console output for specific error messages
5. Review the configuration files for any misconfigurations

## Examples

### Development Workflow
```bash
# 1. Set up environment
node scripts/setup-environments.js setup

# 2. Test with minimal data
npm run seed:quick --env=local

# 3. Generate full dataset for development
npm run seed:full --env=local

# 4. Clear and regenerate for testing
npm run seed:generate -- --clear --env=local
```

### Production Deployment
```bash
# 1. Set up production environment
export STRAPI_TOKEN_RENDER="your_production_token"

# 2. Generate production data
npm run seed:generate -- --env=render --consultants=10 --properties=20
```

### Custom Scenarios
```bash
# Generate only office properties
# (Modify the script to filter property types)

# Generate posts for specific consultants
# (Modify the script to target specific consultant IDs)

# Generate engagement data for specific posts
# (Modify the script to target specific post IDs)
``` 