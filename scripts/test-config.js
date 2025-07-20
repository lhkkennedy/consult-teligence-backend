#!/usr/bin/env node

/**
 * Test Configuration Script
 * 
 * This script tests the configuration system to ensure it's working properly.
 */

require('dotenv').config();

const { setEnvironment, getCurrentEnvironment, listEnvironments } = require('./environments');
const getConfig = require('./mock-data-config');

console.log('🧪 Testing Configuration System');
console.log('===============================\n');

try {
  // Test 1: List environments
  console.log('1️⃣ Testing environment listing...');
  const environments = listEnvironments();
  console.log(`✅ Found ${environments.length} environments:`);
  environments.forEach(env => {
    console.log(`   - ${env.key}: ${env.name}`);
  });
  console.log('');

  // Test 2: Test environment switching
  console.log('2️⃣ Testing environment switching...');
  setEnvironment('local');
  const localEnv = getCurrentEnvironment();
  console.log(`✅ Switched to local environment: ${localEnv.name}`);
  console.log(`   URL: ${localEnv.url}`);
  console.log('');

  // Test 3: Test configuration loading
  console.log('3️⃣ Testing configuration loading...');
  const config = getConfig();
  console.log(`✅ Configuration loaded successfully`);
  console.log(`   API URL: ${config.api.baseUrl}`);
  console.log(`   Token configured: ${config.api.token ? 'Yes' : 'No'}`);
  console.log(`   Timeout: ${config.api.timeout}ms`);
  console.log('');

  // Test 4: Test environment-specific overrides
  console.log('4️⃣ Testing environment-specific behavior...');
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Environment Name: ${config.environmentName}`);
  console.log(`   Clear Data Enabled: ${config.cleanup.clearExisting}`);
  console.log(`   Detailed Logging: ${config.output.logLevel === 'info'}`);
  console.log('');

  // Test 5: Test Render environment
  console.log('5️⃣ Testing Render environment...');
  setEnvironment('render');
  const renderConfig = getConfig();
  console.log(`✅ Switched to Render environment: ${renderConfig.environmentName}`);
  console.log(`   URL: ${renderConfig.api.baseUrl}`);
  console.log(`   Clear Data Enabled: ${renderConfig.cleanup.clearExisting}`);
  console.log(`   Detailed Logging: ${renderConfig.output.logLevel === 'info'}`);
  console.log('');

  console.log('🎉 All configuration tests passed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Set up your API tokens: npm run seed:setup');
  console.log('   2. Test with local: npm run seed:quick -- --env=local');
  console.log('   3. Test with Render: npm run seed:quick -- --env=render');

} catch (error) {
  console.error('❌ Configuration test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}