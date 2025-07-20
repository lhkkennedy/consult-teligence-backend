#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps you configure environment variables for different
 * environments (localhost, Render, staging).
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Environment configuration template
const envTemplate = `# ConsultTeligence Mock Data Generation Environment Variables

# Local Development (localhost:1337)
STRAPI_TOKEN_LOCAL=your_local_token_here

# Render Production (https://consult-teligence-backend.onrender.com)
STRAPI_TOKEN_RENDER=your_render_token_here

# Staging Environment (optional)
STRAPI_TOKEN_STAGING=your_staging_token_here

# Fallback token (used if specific environment token is not set)
STRAPI_TOKEN=your_fallback_token_here

# Optional: Override API URL
# STRAPI_URL=https://custom-url.com/api
`;

// Instructions for getting tokens
const tokenInstructions = {
  local: {
    title: 'Local Development Token',
    steps: [
      '1. Start your local Strapi application: npm run develop',
      '2. Go to http://localhost:1337/admin',
      '3. Log in to your admin panel',
      '4. Go to Settings > API Tokens',
      '5. Create a new token with "Full access" permissions',
      '6. Copy the generated token'
    ]
  },
  render: {
    title: 'Render Production Token',
    steps: [
      '1. Go to https://consult-teligence-backend.onrender.com/admin',
      '2. Log in to your admin panel',
      '3. Go to Settings > API Tokens',
      '4. Create a new token with "Full access" permissions',
      '5. Copy the generated token',
      '6. Note: Be careful with production tokens!'
    ]
  }
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function showInstructions(env) {
  const instructions = tokenInstructions[env];
  if (!instructions) return;
  
  console.log(`\n📋 ${instructions.title}:`);
  console.log('='.repeat(instructions.title.length + 2));
  instructions.steps.forEach(step => {
    console.log(`   ${step}`);
  });
  console.log('');
}

async function setupEnvironment() {
  console.log('🚀 ConsultTeligence Environment Setup');
  console.log('=====================================\n');
  
  console.log('This script will help you configure environment variables for mock data generation.');
  console.log('You can set up tokens for different environments (local, Render, staging).\n');
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('📁 Found existing .env file');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('\n🌍 Environment Configuration');
  console.log('============================\n');
  
  let envContent = envTemplate;
  
  // Local environment
  console.log('1️⃣  Local Development (localhost:1337)');
  showInstructions('local');
  const localToken = await question('Enter your local development token (or press Enter to skip): ');
  if (localToken.trim()) {
    envContent = envContent.replace('your_local_token_here', localToken.trim());
  }
  
  // Render environment
  console.log('\n2️⃣  Render Production');
  showInstructions('render');
  const renderToken = await question('Enter your Render production token (or press Enter to skip): ');
  if (renderToken.trim()) {
    envContent = envContent.replace('your_render_token_here', renderToken.trim());
  }
  
  // Staging environment
  console.log('\n3️⃣  Staging Environment (optional)');
  const stagingToken = await question('Enter your staging token (or press Enter to skip): ');
  if (stagingToken.trim()) {
    envContent = envContent.replace('your_staging_token_here', stagingToken.trim());
  }
  
  // Fallback token
  console.log('\n4️⃣  Fallback Token');
  console.log('This token will be used if a specific environment token is not set.');
  const fallbackToken = await question('Enter your fallback token (or press Enter to skip): ');
  if (fallbackToken.trim()) {
    envContent = envContent.replace('your_fallback_token_here', fallbackToken.trim());
  }
  
  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment configuration saved to .env file');
  } catch (error) {
    console.error('\n❌ Failed to write .env file:', error.message);
    rl.close();
    return;
  }
  
  // Show next steps
  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Load the environment variables:');
  console.log('   source .env');
  console.log('   # or');
  console.log('   export $(cat .env | xargs)');
  console.log('');
  console.log('2. Test your configuration:');
  console.log('   node scripts/seed-database.js env');
  console.log('');
  console.log('3. Generate mock data:');
  console.log('   # For local development');
  console.log('   node scripts/seed-database.js --env=local');
  console.log('');
  console.log('   # For Render production');
  console.log('   node scripts/seed-database.js --env=render');
  console.log('');
  console.log('4. Or use npm scripts:');
  console.log('   npm run seed:quick -- --env=local');
  console.log('   npm run seed:full -- --env=render');
  
  rl.close();
}

// Run setup
if (require.main === module) {
  setupEnvironment().catch(error => {
    console.error('Setup failed:', error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = {
  setupEnvironment,
  tokenInstructions
};