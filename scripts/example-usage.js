#!/usr/bin/env node

/**
 * Example usage of the mock data generation system
 * 
 * This script demonstrates how to use the mock data generators
 * programmatically for different scenarios.
 */

const { generateMockData } = require('./generate-mock-data-enhanced');
const config = require('./mock-data-config');

// Example 1: Basic usage
async function basicExample() {
  console.log('🚀 Example 1: Basic mock data generation');
  
  try {
    await generateMockData();
    console.log('✅ Basic generation completed successfully!');
  } catch (error) {
    console.error('❌ Basic generation failed:', error.message);
  }
}

// Example 2: Custom configuration
async function customConfigExample() {
  console.log('\n🚀 Example 2: Custom configuration');
  
  // Modify config for this example
  config.generation.consultants = 3;
  config.generation.properties = 5;
  config.generation.posts = 8;
  config.generation.reactions.probability = 0.5;
  config.generation.comments.probability = 0.5;
  config.output.showProgress = false;
  
  try {
    await generateMockData();
    console.log('✅ Custom configuration generation completed!');
  } catch (error) {
    console.error('❌ Custom configuration generation failed:', error.message);
  }
}

// Example 3: Minimal data for testing
async function minimalExample() {
  console.log('\n🚀 Example 3: Minimal data for testing');
  
  // Set minimal configuration
  config.generation.consultants = 2;
  config.generation.properties = 3;
  config.generation.posts = 5;
  config.generation.reactions.probability = 0.3;
  config.generation.comments.probability = 0.3;
  config.generation.saves.probability = 0.2;
  config.generation.views.probability = 0.5;
  config.output.showProgress = false;
  
  try {
    await generateMockData();
    console.log('✅ Minimal data generation completed!');
  } catch (error) {
    console.error('❌ Minimal data generation failed:', error.message);
  }
}

// Example 4: Focus on specific content types
async function focusedExample() {
  console.log('\n🚀 Example 4: Focus on specific content types');
  
  // Focus on office and industrial properties
  config.content.propertyTypes = ['Office', 'Industrial'];
  config.content.locations = ['New York, NY', 'San Francisco, CA', 'Chicago, IL'];
  config.generation.consultants = 4;
  config.generation.properties = 6;
  config.generation.posts = 10;
  config.output.showProgress = false;
  
  try {
    await generateMockData();
    console.log('✅ Focused generation completed!');
  } catch (error) {
    console.error('❌ Focused generation failed:', error.message);
  }
}

// Example 5: Data without engagement
async function noEngagementExample() {
  console.log('\n🚀 Example 5: Data without engagement');
  
  // Disable all engagement
  config.generation.reactions.probability = 0;
  config.generation.comments.probability = 0;
  config.generation.saves.probability = 0;
  config.generation.views.probability = 0;
  config.generation.consultants = 3;
  config.generation.properties = 4;
  config.generation.posts = 6;
  config.output.showProgress = false;
  
  try {
    await generateMockData();
    console.log('✅ No-engagement generation completed!');
  } catch (error) {
    console.error('❌ No-engagement generation failed:', error.message);
  }
}

// Main execution
async function runExamples() {
  console.log('📚 Mock Data Generation Examples');
  console.log('================================\n');
  
  // Check if API token is available
  if (!config.api.token) {
    console.error('❌ STRAPI_TOKEN environment variable is required');
    console.log('Please set your Strapi API token:');
    console.log('export STRAPI_TOKEN="your-token-here"');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   API URL: ${config.api.baseUrl}`);
  console.log(`   API Token: ${config.api.token ? '✅ Set' : '❌ Missing'}\n`);
  
  // Run examples
  await basicExample();
  await customConfigExample();
  await minimalExample();
  await focusedExample();
  await noEngagementExample();
  
  console.log('\n🎉 All examples completed!');
  console.log('\n💡 Tips:');
  console.log('   - Use "npm run seed:quick" for quick testing');
  console.log('   - Use "npm run seed:full" for comprehensive data');
  console.log('   - Use "npm run seed:clear" to clear and regenerate');
  console.log('   - Check scripts/MOCK_DATA_README.md for more details');
}

// Run if called directly
if (require.main === module) {
  runExamples();
}

module.exports = {
  basicExample,
  customConfigExample,
  minimalExample,
  focusedExample,
  noEngagementExample,
  runExamples
};