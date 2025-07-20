/**
 * Environment Configuration for Mock Data Generation
 * 
 * This file manages different environments (localhost, staging, production)
 * and provides easy switching between them.
 */

const environments = {
  local: {
    name: 'Local Development',
    url: 'http://localhost:1337/api',
    description: 'Local Strapi instance running on localhost:1337',
    token: process.env.STRAPI_TOKEN_LOCAL || process.env.TOKEN || process.env.STRAPI_TOKEN,
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
    timeout: 60000, // Longer timeout for hosted service
    features: {
      clearData: false, // Be more careful with production
      bulkOperations: true,
      detailedLogging: false
    }
  },
  
  staging: {
    name: 'Staging Environment',
    url: process.env.STRAPI_URL_STAGING || 'https://your-staging-url.com/api',
    description: 'Staging environment for testing',
    token: process.env.STRAPI_TOKEN_STAGING || process.env.STRAPI_TOKEN,
    timeout: 45000,
    features: {
      clearData: true,
      bulkOperations: true,
      detailedLogging: true
    }
  }
};

// Default environment
let currentEnvironment = 'local';

// Environment management functions
function getCurrentEnvironment() {
  return environments[currentEnvironment];
}

function setEnvironment(envName) {
  if (!environments[envName]) {
    throw new Error(`Unknown environment: ${envName}. Available: ${Object.keys(environments).join(', ')}`);
  }
  currentEnvironment = envName;
  return environments[envName];
}

function listEnvironments() {
  return Object.keys(environments).map(key => ({
    key,
    ...environments[key]
  }));
}

function validateEnvironment(envName = currentEnvironment) {
  const env = environments[envName];
  if (!env) {
    throw new Error(`Environment not found: ${envName}`);
  }
  
  if (!env.token) {
    throw new Error(`No API token configured for environment: ${envName}`);
  }
  
  return env;
}

// Export environment config for use in other scripts
function getEnvironmentConfig() {
  const env = getCurrentEnvironment();
  return {
    api: {
      baseUrl: env.url,
      token: env.token,
      timeout: env.timeout
    },
    features: env.features,
    environment: currentEnvironment,
    environmentName: env.name
  };
}

// Environment-specific configuration overrides
function getEnvironmentOverrides() {
  const env = getCurrentEnvironment();
  
  const overrides = {
    output: {
      logLevel: env.features.detailedLogging ? 'info' : 'warn',
      showProgress: env.features.detailedLogging
    },
    cleanup: {
      clearExisting: env.features.clearData
    }
  };
  
  // Adjust generation settings based on environment
  if (currentEnvironment === 'render') {
    // Be more conservative with production
    overrides.generation = {
      reactions: { probability: 0.7 },
      comments: { probability: 0.7 },
      saves: { probability: 0.3 },
      views: { probability: 0.6 }
    };
  }
  
  return overrides;
}

module.exports = {
  environments,
  getCurrentEnvironment,
  setEnvironment,
  listEnvironments,
  validateEnvironment,
  getEnvironmentConfig,
  getEnvironmentOverrides,
  currentEnvironment
};