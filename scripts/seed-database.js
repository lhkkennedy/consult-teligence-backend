#!/usr/bin/env node

const { generateMockData } = require('./generate-mock-data-enhanced');
const config = require('./mock-data-config');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Help function
function showHelp() {
  console.log(`
🚀 ConsultTeligence Mock Data Generator

Usage: node scripts/seed-database.js [command] [options]

Commands:
  generate, g     Generate all mock data (default)
  quick, q        Generate minimal data for quick testing
  full, f         Generate comprehensive data set
  help, h         Show this help message

Options:
  --consultants=N    Number of consultants to create (default: all)
  --properties=N     Number of properties to create (default: all)
  --posts=N          Number of posts to create (default: all)
  --no-engagement    Skip creating reactions, comments, saves, and views
  --clear            Clear existing data before generation
  --config=FILE      Use custom config file

Examples:
  node scripts/seed-database.js                    # Generate all data
  node scripts/seed-database.js quick              # Quick test data
  node scripts/seed-database.js --consultants=3    # Only 3 consultants
  node scripts/seed-database.js --no-engagement    # Skip engagement data
  node scripts/seed-database.js --clear            # Clear and regenerate

Environment Variables:
  STRAPI_URL         Strapi API URL (default: http://localhost:1337/api)
  STRAPI_TOKEN       Strapi API token (required)

Configuration:
  Edit scripts/mock-data-config.js to customize generation settings
`);
}

// Parse options
function parseOptions(args) {
  const options = {
    consultants: null,
    properties: null,
    posts: null,
    skipEngagement: false,
    clearExisting: false,
    configFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--consultants=')) {
      options.consultants = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--properties=')) {
      options.properties = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--posts=')) {
      options.posts = parseInt(arg.split('=')[1]);
    } else if (arg === '--no-engagement') {
      options.skipEngagement = true;
    } else if (arg === '--clear') {
      options.clearExisting = true;
    } else if (arg.startsWith('--config=')) {
      options.configFile = arg.split('=')[1];
    }
  }

  return options;
}

// Apply options to config
function applyOptions(options) {
  if (options.consultants !== null) {
    config.generation.consultants = options.consultants;
  }
  if (options.properties !== null) {
    config.generation.properties = options.properties;
  }
  if (options.posts !== null) {
    config.generation.posts = options.posts;
  }
  if (options.skipEngagement) {
    config.generation.reactions.probability = 0;
    config.generation.comments.probability = 0;
    config.generation.saves.probability = 0;
    config.generation.views.probability = 0;
  }
  if (options.clearExisting) {
    config.cleanup.clearExisting = true;
  }
}

// Quick generation preset
function setQuickPreset() {
  config.generation.consultants = 2;
  config.generation.properties = 3;
  config.generation.posts = 5;
  config.generation.reactions.probability = 0.5;
  config.generation.comments.probability = 0.5;
  config.generation.saves.probability = 0.2;
  config.generation.views.probability = 0.5;
  config.output.showProgress = false;
}

// Full generation preset
function setFullPreset() {
  config.generation.consultants = null; // All
  config.generation.properties = null; // All
  config.generation.posts = null; // All
  config.generation.reactions.probability = 0.9;
  config.generation.comments.probability = 0.9;
  config.generation.saves.probability = 0.4;
  config.generation.views.probability = 0.8;
  config.output.showProgress = true;
  config.output.generateReport = true;
}

// Main execution
async function main() {
  try {
    // Parse command and options
    const options = parseOptions(args);
    
    // Handle commands
    switch (command) {
      case 'help':
      case 'h':
        showHelp();
        return;
        
      case 'quick':
      case 'q':
        setQuickPreset();
        console.log('⚡ Quick generation mode - minimal data for testing');
        break;
        
      case 'full':
      case 'f':
        setFullPreset();
        console.log('📊 Full generation mode - comprehensive data set');
        break;
        
      case 'generate':
      case 'g':
      case undefined:
        // Default generation
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
    
    // Apply options
    applyOptions(options);
    
    // Validate configuration
    if (!config.api.token) {
      console.error('❌ STRAPI_TOKEN environment variable is required');
      console.log('Please set your Strapi API token:');
      console.log('export STRAPI_TOKEN="your-token-here"');
      process.exit(1);
    }
    
    // Show configuration summary
    console.log('\n📋 Generation Configuration:');
    console.log(`   API URL: ${config.api.baseUrl}`);
    console.log(`   Consultants: ${config.generation.consultants || 'All'}`);
    console.log(`   Properties: ${config.generation.properties || 'All'}`);
    console.log(`   Posts: ${config.generation.posts || 'All'}`);
    console.log(`   Engagement: ${!options.skipEngagement ? 'Enabled' : 'Disabled'}`);
    console.log(`   Clear existing: ${config.cleanup.clearExisting ? 'Yes' : 'No'}`);
    
    // Confirm before proceeding
    if (config.cleanup.clearExisting) {
      console.log('\n⚠️  WARNING: This will clear existing data before generation!');
      console.log('Press Ctrl+C to cancel or any key to continue...');
      
      // Wait for user input
      await new Promise(resolve => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => {
          process.stdin.setRawMode(false);
          resolve();
        });
      });
    }
    
    console.log('\n🚀 Starting mock data generation...\n');
    
    // Generate mock data
    await generateMockData();
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main,
  showHelp,
  parseOptions,
  applyOptions
};