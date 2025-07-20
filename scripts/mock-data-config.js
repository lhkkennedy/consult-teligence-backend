// Configuration for mock data generation
const { getEnvironmentConfig, getEnvironmentOverrides } = require('./environments');

// Base configuration
const baseConfig = {
  // API Configuration (will be overridden by environment)
  api: {
    baseUrl: process.env.STRAPI_URL || 'http://localhost:1337/api',
    token: process.env.STRAPI_TOKEN,
    timeout: 30000
  },

  // Generation settings
  generation: {
    // Number of items to create (set to null to use all data)
    consultants: null, // null = all, or specify number
    properties: null,
    posts: null,
    
    // Engagement settings
    reactions: {
      minPerPost: 3,
      maxPerPost: 8,
      probability: 0.8 // 80% chance of creating reactions
    },
    
    comments: {
      minPerPost: 2,
      maxPerPost: 5,
      probability: 0.9 // 90% chance of creating comments
    },
    
    saves: {
      probability: 0.3 // 30% chance of each consultant saving a post
    },
    
    views: {
      probability: 0.7, // 70% chance of each consultant viewing a post
      minDuration: 30, // seconds
      maxDuration: 330 // seconds
    }
  },

  // Data sources
  dataSources: {
    // Use existing mock data files
    useExistingFiles: true,
    
    // Paths to existing mock data
    paths: {
      properties: './scripts/data-import/mockData/mockProperties*.json',
      timelinePosts: './scripts/data-import/mockData/mockTimelinePosts*.json',
      portfolioStats: './scripts/data-import/mockData/mockPortfolioStats*.json'
    },
    
    // Use external data sources
    external: {
      images: {
        enabled: true,
        source: 'unsplash', // 'unsplash', 'local', or 'none'
        categories: ['office', 'industrial', 'residential', 'retail']
      },
      
      names: {
        enabled: true,
        source: 'faker', // 'faker' or 'custom'
        locale: 'en_US'
      }
    }
  },

  // Content customization
  content: {
    // Post types to include
    postTypes: ['NewListing', 'ProgressUpdate', 'Insight', 'Closing', 'Property'],
    
    // Property types to include
    propertyTypes: ['Office', 'Industrial', 'Residential', 'Retail', 'Mixed Use', 'Luxury Residential'],
    
    // Locations to use
    locations: [
      'New York, NY',
      'San Francisco, CA',
      'Los Angeles, CA',
      'Chicago, IL',
      'Miami, FL',
      'Boston, MA',
      'Seattle, WA',
      'Austin, TX',
      'Denver, CO',
      'Atlanta, GA'
    ],
    
    // Deal sizes
    dealSizes: [
      'Under $10M',
      '$10M - $25M',
      '$25M - $50M',
      '$50M - $100M',
      '$100M+'
    ],
    
    // Sentiments
    sentiments: ['Bull', 'Bear', 'Neutral'],
    
    // Tags to use
    tags: [
      'tech', 'office', 'industrial', 'residential', 'retail', 'luxury',
      'investment', 'development', 'market-insight', 'closing', 'trending',
      'san-francisco', 'new-york', 'miami', 'chicago', 'los-angeles',
      'remote-work', 'esg', 'sustainability', 'logistics', 'e-commerce'
    ]
  },

  // Relationships
  relationships: {
    // How to assign posts to consultants
    postAssignment: 'random', // 'random', 'round-robin', or 'weighted'
    
    // How to assign properties to posts
    propertyAssignment: 'matching', // 'matching', 'random', or 'none'
    
    // Cross-references between content
    enableCrossReferences: true,
    
    // Create realistic engagement patterns
    realisticEngagement: true
  },

  // Output and logging
  output: {
    // Console output level
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Save generated data to files
    saveToFiles: false,
    outputDir: './scripts/generated-data',
    
    // Generate summary report
    generateReport: true,
    
    // Show progress bars
    showProgress: true
  },

  // Validation
  validation: {
    // Validate data before creation
    validateBeforeCreate: true,
    
    // Check for duplicates
    checkDuplicates: true,
    
    // Required fields validation
    requiredFields: {
      consultant: ['firstName', 'lastName', 'email'],
      property: ['title', 'address', 'property_type'],
      post: ['body_md', 'post_type', 'sentiment']
    }
  },

  // Cleanup options
  cleanup: {
    // Remove existing data before generation
    clearExisting: false,
    
    // Clear specific content types
    clearTypes: [], // ['consultants', 'properties', 'posts', 'reactions', 'comments']
    
    // Backup before clearing
    backupBeforeClear: true
  }
};

// Get merged configuration
function getConfig() {
  try {
    const envConfig = getEnvironmentConfig();
    const envOverrides = getEnvironmentOverrides();
    
    return {
      ...baseConfig,
      ...envConfig,
      ...envOverrides
    };
  } catch (error) {
    // Fallback to base config if environment config fails
    console.warn('⚠️ Environment configuration failed, using base config:', error.message);
    return baseConfig;
  }
}

// Export the configuration function
module.exports = getConfig;