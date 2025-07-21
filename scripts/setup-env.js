const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateRandomKey() {
  return crypto.randomBytes(32).toString('base64');
}

function setupEnvironment() {
  const envPath = path.join(__dirname, '..', '.env');
  
  console.log('Setting up environment variables...');
  
  // Check if .env file already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }
  
  // Generate random keys
  const appKeys = [
    generateRandomKey(),
    generateRandomKey(),
    generateRandomKey(),
    generateRandomKey()
  ];
  
  const adminJwtSecret = generateRandomKey();
  const apiTokenSalt = generateRandomKey();
  const transferTokenSalt = generateRandomKey();
  const jwtSecret = generateRandomKey();
  
  // Create .env content
  const envContent = `# Strapi Environment Variables
# Generated automatically - DO NOT commit this file to version control

# App Keys (required for session middleware)
APP_KEYS=${appKeys.join(',')}

# JWT Secrets
ADMIN_JWT_SECRET=${adminJwtSecret}
API_TOKEN_SALT=${apiTokenSalt}
TRANSFER_TOKEN_SALT=${transferTokenSalt}
JWT_SECRET=${jwtSecret}

# Database Configuration
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server Configuration
HOST=0.0.0.0
PORT=1337

# CORS Origins (comma-separated)
CORS_ORIGIN=https://consult-teligence-frontend.vercel.app,http://localhost:5173

# Optional: Database URL for production
# DATABASE_URL=your_database_url_here

# Optional: Environment
NODE_ENV=development
`;
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Created .env file with required environment variables');
  console.log('📝 Please review and update the .env file as needed for your environment');
  console.log('🔒 Make sure to add .env to your .gitignore file');
}

// Run the setup
setupEnvironment(); 