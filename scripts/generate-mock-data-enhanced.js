const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
require('dotenv').config();

// Load configuration
const getConfig = require('./mock-data-config');
let config;

// Initialize config when needed
function getConfigInstance() {
  // Always get fresh config to ensure environment changes are picked up
  config = getConfig();
  return config;
}

// Initialize configuration
config = getConfigInstance();

// Configuration
const API_BASE_URL = config.api.baseUrl;
const API_TOKEN = config.api.token;

if (!API_TOKEN) {
  console.error('❌ STRAPI_TOKEN environment variable is required');
  console.log('💡 Set your API token using one of these methods:');
  console.log('   export STRAPI_TOKEN_LOCAL="your_token_here"');
  console.log('   export STRAPI_TOKEN="your_token_here"');
  console.log('   Or create a .env file with STRAPI_TOKEN=your_token_here');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.startTime = Date.now();
    this.counts = {
      consultants: 0,
      properties: 0,
      posts: 0,
      reactions: 0,
      comments: 0,
      saves: 0,
      views: 0
    };
    this.errors = [];
  }

  increment(type) {
    this.counts[type]++;
  }

  addError(type, error) {
    this.errors.push({ type, error: error.message });
  }

  logProgress(type, message) {
    const currentConfig = getConfigInstance();
    if (currentConfig.output.showProgress) {
      console.log(`✅ ${message} (${this.counts[type]} total)`);
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    const currentConfig = getConfigInstance();
    
    console.log('\n📊 Mock Data Generation Report');
    console.log('==============================');
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Successfully created:`);
    Object.entries(this.counts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(({ type, error }) => {
        console.log(`  - ${type}: ${error}`);
      });
    }
  }
}

// Data loader for existing mock files
class MockDataLoader {
  async loadExistingData() {
    const data = {
      properties: [],
      timelinePosts: [],
      portfolioStats: []
    };

    const currentConfig = getConfigInstance();
    if (currentConfig.dataSources.useExistingFiles) {
      try {
        // Load properties
        const propertyFiles = glob.sync(currentConfig.dataSources.paths.properties);
        for (const file of propertyFiles) {
          const content = await fs.readFile(file, 'utf8');
          const properties = JSON.parse(content);
          data.properties.push(...properties);
        }

        // Load timeline posts
        const postFiles = glob.sync(currentConfig.dataSources.paths.timelinePosts);
        for (const file of postFiles) {
          const content = await fs.readFile(file, 'utf8');
          const posts = JSON.parse(content);
          data.timelinePosts.push(...posts);
        }

        // Load portfolio stats
        const statsFiles = glob.sync(currentConfig.dataSources.paths.portfolioStats);
        for (const file of statsFiles) {
          const content = await fs.readFile(file, 'utf8');
          const stats = JSON.parse(content);
          data.portfolioStats.push(...stats);
        }

        console.log(`📁 Loaded existing data: ${data.properties.length} properties, ${data.timelinePosts.length} posts`);
      } catch (error) {
        console.warn(`⚠️ Warning: Could not load existing mock data: ${error.message}`);
      }
    }

    return data;
  }
}

// Generate unique property UIDs
function generatePropertyUIDs() {
  const timestamp = Date.now();
  return [
    `PROP-${timestamp}-001`,
    `PROP-${timestamp}-002`, 
    `PROP-${timestamp}-003`
  ];
}

// Enhanced mock data with more variety - UPDATED TO MATCH SCHEMAS
const enhancedMockData = {
  consultants: [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      location: 'New York, NY',
      company: 'Johnson & Associates',
      currentRole: 'Senior Real Estate Consultant',
      functionalExpertise: ['Commercial Real Estate', 'Investment Analysis', 'Market Research'],
      geographicalExpertise: 'North America',
      countryExpertise: 'United States',
      rate: 250.00,
      bio: 'Sarah is a seasoned real estate professional with over 15 years of experience in commercial property investment and market analysis.',
      education: 'MBA from Columbia Business School, specializing in Real Estate Finance',
      certifications: ['CCIM', 'CRE'],
      languages: ['English', 'Spanish'],
      profileImage: null, // Will be handled separately
      contactInfo: {
        email: 'sarah.johnson@consultteligence.com',
        phone: '+1-555-0101',
        linkedin: 'https://linkedin.com/in/sarahjohnson'
      },
      availability: 'Available for new projects',
      testimonials: [],
      caseStudies: [],
      total_gfa: 2500000,
      total_aum: 500000000,
      deal_count: 45,
      avg_deal_size: 15000000
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      location: 'San Francisco, CA',
      company: 'Chen Capital Partners',
      currentRole: 'Investment Strategist',
      functionalExpertise: ['Venture Capital', 'Tech Real Estate', 'Portfolio Management'],
      geographicalExpertise: 'North America',
      countryExpertise: 'United States',
      rate: 300.00,
      bio: 'Michael specializes in technology-focused real estate investments and has helped scale numerous proptech companies.',
      education: 'MBA from Stanford Graduate School of Business',
      certifications: ['CFA', 'MBA'],
      languages: ['English', 'Mandarin'],
      profileImage: null,
      contactInfo: {
        email: 'michael.chen@consultteligence.com',
        phone: '+1-555-0102',
        linkedin: 'https://linkedin.com/in/michaelchen'
      },
      availability: 'Limited availability',
      testimonials: [],
      caseStudies: [],
      total_gfa: 1800000,
      total_aum: 300000000,
      deal_count: 32,
      avg_deal_size: 12000000
    },
    {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      location: 'Miami, FL',
      company: 'Rodriguez Development Group',
      currentRole: 'Development Director',
      functionalExpertise: ['Residential Development', 'Luxury Properties', 'International Markets'],
      geographicalExpertise: 'South America',
      countryExpertise: 'Brazil',
      rate: 275.00,
      bio: 'Emily leads high-end residential development projects across Latin America and the Caribbean.',
      education: 'Master of Architecture from Harvard Graduate School of Design',
      certifications: ['LEED AP', 'PMI'],
      languages: ['English', 'Spanish', 'Portuguese'],
      profileImage: null,
      contactInfo: {
        email: 'emily.rodriguez@consultteligence.com',
        phone: '+1-555-0103',
        linkedin: 'https://linkedin.com/in/emilyrodriguez'
      },
      availability: 'Available for new projects',
      testimonials: [],
      caseStudies: [],
      total_gfa: 3200000,
      total_aum: 750000000,
      deal_count: 28,
      avg_deal_size: 25000000
    },
    {
      firstName: 'David',
      lastName: 'Thompson',
      location: 'Chicago, IL',
      company: 'Thompson Industrial Partners',
      currentRole: 'Industrial Real Estate Specialist',
      functionalExpertise: ['Industrial Properties', 'Logistics', 'Supply Chain'],
      geographicalExpertise: 'North America',
      countryExpertise: 'United States',
      rate: 225.00,
      bio: 'David focuses on industrial real estate investments and has extensive experience in logistics and distribution centers.',
      education: 'BS in Civil Engineering from University of Illinois',
      certifications: ['SIOR', 'CCIM'],
      languages: ['English'],
      profileImage: null,
      contactInfo: {
        email: 'david.thompson@consultteligence.com',
        phone: '+1-555-0104',
        linkedin: 'https://linkedin.com/in/davidthompson'
      },
      availability: 'Available for new projects',
      testimonials: [],
      caseStudies: [],
      total_gfa: 4500000,
      total_aum: 900000000,
      deal_count: 67,
      avg_deal_size: 18000000
    }
  ],
  properties: [
    {
      property_uid: 'PROP-001', // Will be replaced with unique UID
      title: 'Downtown Tech Hub',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      property_type: 'Office',
      status: 'Stabilised',
      headline_metric: '95% Occupancy Rate',
      media_urls: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
      ],
      roles: ['Investment', 'Development', 'Management'],
      deal_size: 85000000.00,
      irr: 12.5,
      completion_percentage: 100,
      tags: ['tech', 'office', 'san-francisco', 'investment']
    },
    {
      property_uid: 'PROP-002', // Will be replaced with unique UID
      title: 'Riverside Luxury Condos',
      address: '456 Waterfront Blvd, Miami, FL 33101',
      property_type: 'Residential',
      status: 'Under Construction',
      headline_metric: '75% Pre-sold',
      media_urls: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      roles: ['Development', 'Sales', 'Marketing'],
      deal_size: 120000000.00,
      irr: 18.2,
      completion_percentage: 65,
      tags: ['luxury', 'residential', 'miami', 'development']
    },
    {
      property_uid: 'PROP-003', // Will be replaced with unique UID
      title: 'Logistics Distribution Center',
      address: '789 Industrial Way, Chicago, IL 60601',
      property_type: 'Industrial',
      status: 'Planning',
      headline_metric: '500,000 sq ft Facility',
      media_urls: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
        'https://images.unsplash.com/photo-1586528116493-6c8b5b3b1b1b?w=800'
      ],
      roles: ['Investment', 'Development', 'Leasing'],
      deal_size: 45000000.00,
      irr: 15.8,
      completion_percentage: 25,
      tags: ['industrial', 'logistics', 'chicago', 'investment']
    }
  ],
  posts: [
    {
      post_type: 'NewListing',
      body_md: 'Excited to announce our latest office investment opportunity in the heart of San Francisco\'s tech district. This Class A office building offers exceptional returns with strong tenant demand.',
      sentiment: 'Bull',
      tags: ['tech', 'office', 'investment', 'san-francisco']
    },
    {
      post_type: 'ProgressUpdate',
      body_md: 'Construction is progressing ahead of schedule on our luxury residential development. We\'ve reached 75% completion and pre-sales are exceeding expectations.',
      sentiment: 'Bull',
      tags: ['luxury', 'residential', 'development', 'miami']
    },
    {
      post_type: 'Insight',
      body_md: 'Market analysis shows strong growth in industrial real estate, particularly in logistics and distribution. E-commerce continues to drive demand for warehouse space.',
      sentiment: 'Bull',
      tags: ['industrial', 'market-insight', 'e-commerce', 'logistics']
    },
    {
      post_type: 'Closing',
      body_md: 'Successfully closed on our latest investment property. This acquisition represents our continued focus on high-growth markets with strong fundamentals.',
      sentiment: 'Bull',
      tags: ['closing', 'investment', 'trending']
    },
    {
      post_type: 'Property',
      body_md: 'Featured property: Downtown Tech Hub - A premium office building in San Francisco with 95% occupancy and strong rental growth potential.',
      sentiment: 'Bull',
      tags: ['property', 'office', 'san-francisco', 'investment']
    }
  ],
  reactions: [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'celebrate', emoji: '🎉' },
    { type: 'insightful', emoji: '💡' }
  ]
};

// Utility functions
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const currentConfig = getConfigInstance();
    const requestConfig = {
      method,
      url: `${currentConfig.api.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${currentConfig.api.token}`,
        'Content-Type': 'application/json'
      },
      timeout: currentConfig.api.timeout,
      ...(data && { data })
    };
    
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error(`❌ Error making ${method} request to ${endpoint}:`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error(`   Network Error: ${error.message}`);
      console.error(`   URL: ${API_BASE_URL}${endpoint}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    throw error;
  }
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomDate(start = new Date(2023, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Data validation
function validateData(data, type) {
  const currentConfig = getConfigInstance();
  const requiredFields = currentConfig.validation.requiredFields[type];
  if (!requiredFields) return true;

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return true;
}

// Main functions
async function createConsultants(progress) {
  console.log('👥 Creating consultants...');
  const currentConfig = getConfigInstance();
  const createdConsultants = [];
  const consultantsToCreate = currentConfig.generation.consultants || enhancedMockData.consultants.length;
  const consultants = enhancedMockData.consultants.slice(0, consultantsToCreate);
  
  for (const consultant of consultants) {
    try {
      if (currentConfig.validation.validateBeforeCreate) {
        validateData(consultant, 'consultant');
      }

      const response = await makeRequest('/consultants', 'POST', {
        data: {
          firstName: consultant.firstName,
          lastName: consultant.lastName,
          location: consultant.location,
          company: consultant.company,
          currentRole: consultant.currentRole,
          functionalExpertise: consultant.functionalExpertise,
          geographicalExpertise: consultant.geographicalExpertise,
          countryExpertise: consultant.countryExpertise,
          rate: consultant.rate,
          bio: consultant.bio,
          education: consultant.education,
          certifications: consultant.certifications,
          languages: consultant.languages,
          profileImage: consultant.profileImage,
          contactInfo: consultant.contactInfo,
          availability: consultant.availability,
          testimonials: consultant.testimonials,
          caseStudies: consultant.caseStudies,
          total_gfa: consultant.total_gfa,
          total_aum: consultant.total_aum,
          deal_count: consultant.deal_count,
          avg_deal_size: consultant.avg_deal_size
        }
      });
      
      createdConsultants.push(response.data);
      progress.increment('consultants');
      progress.logProgress('consultants', `Created consultant: ${consultant.firstName} ${consultant.lastName}`);
    } catch (error) {
      progress.addError('consultants', error);
      console.error(`❌ Failed to create consultant ${consultant.firstName} ${consultant.lastName}:`, error.message);
    }
  }
  
  return createdConsultants;
}

async function createProperties(progress) {
  console.log('🏢 Creating properties...');
  const currentConfig = getConfigInstance();
  const createdProperties = [];
  const propertiesToCreate = currentConfig.generation.properties || enhancedMockData.properties.length;
  const properties = enhancedMockData.properties.slice(0, propertiesToCreate);
  
  // Generate unique UIDs for this run
  const uniqueUIDs = generatePropertyUIDs();
  
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    try {
      if (currentConfig.validation.validateBeforeCreate) {
        validateData(property, 'property');
      }

      const response = await makeRequest('/properties', 'POST', {
        data: {
          property_uid: uniqueUIDs[i],
          title: property.title,
          address: property.address,
          property_type: property.property_type,
          status: property.status,
          headline_metric: property.headline_metric,
          media_urls: property.media_urls,
          roles: property.roles,
          deal_size: property.deal_size,
          irr: property.irr,
          completion_percentage: property.completion_percentage,
          tags: property.tags
        }
      });
      
      createdProperties.push(response.data);
      progress.increment('properties');
      progress.logProgress('properties', `Created property: ${property.title}`);
    } catch (error) {
      progress.addError('properties', error);
      console.error(`❌ Failed to create property ${property.title}:`, error.message);
    }
  }
  
  return createdProperties;
}

async function createPosts(consultants, properties, progress) {
  console.log('📝 Creating posts...');
  const currentConfig = getConfigInstance();
  const createdPosts = [];
  
  try {
    // Use the sample posts endpoint which doesn't require user authentication
    console.log('📝 Using sample posts endpoint...');
    const response = await makeRequest('/posts/sample', 'POST', {});
    
    if (response.posts && Array.isArray(response.posts)) {
      createdPosts.push(...response.posts);
      progress.increment('posts');
      progress.logProgress('posts', `Created ${response.posts.length} sample posts`);
    } else if (response.data && Array.isArray(response.data)) {
      createdPosts.push(...response.data);
      progress.increment('posts');
      progress.logProgress('posts', `Created ${response.data.length} sample posts`);
    } else {
      console.log('⚠️ No sample posts returned from endpoint');
      console.log('Response structure:', JSON.stringify(response, null, 2));
    }
  } catch (error) {
    progress.addError('posts', error);
    console.error(`❌ Failed to create sample posts:`, error.message);
    
    // Fallback: try to create individual posts without property relationships
    console.log('🔄 Trying fallback method (without property relationships)...');
    const postsToCreate = currentConfig.generation.posts || enhancedMockData.posts.length;
    const posts = enhancedMockData.posts.slice(0, postsToCreate);
    
    for (const post of posts) {
      try {
        if (currentConfig.validation.validateBeforeCreate) {
          validateData(post, 'post');
        }
        
        const response = await makeRequest('/posts', 'POST', {
          data: {
            post_type: post.post_type,
            body_md: post.body_md,
            sentiment: post.sentiment,
            visibility: 'Public',
            read_time: Math.floor(Math.random() * 5) + 1,
            engagement_score: Math.floor(Math.random() * 100),
            view_count: Math.floor(Math.random() * 1000),
            share_count: Math.floor(Math.random() * 50),
            save_count: Math.floor(Math.random() * 20),
            is_trending: Math.random() > 0.7,
            is_featured: Math.random() > 0.8,
            deal_size: post.deal_size || '$10M - $50M',
            location: post.location || 'New York, NY',
            property_type: post.property_type || 'Office',
            deal_stage: 'Active',
            roi_estimate: '12.5%',
            market_trend: 'Rising',
            publishedAt: generateRandomDate().toISOString()
          }
        });
        
        createdPosts.push(response.data);
        progress.increment('posts');
        progress.logProgress('posts', `Created post: ${post.post_type} - ${post.body_md.substring(0, 50)}...`);
      } catch (error) {
        progress.addError('posts', error);
        console.error(`❌ Failed to create post:`, error.message);
      }
    }
  }
  
  return createdPosts;
}

async function createReactions(posts, consultants, progress) {
  console.log('👍 Creating reactions...');
  const currentConfig = getConfigInstance();
  
  for (const post of posts) {
    if (Math.random() > currentConfig.generation.reactions.probability) continue;
    
    const reactionCountForPost = Math.floor(Math.random() * 
      (currentConfig.generation.reactions.maxPerPost - currentConfig.generation.reactions.minPerPost + 1)) + 
      currentConfig.generation.reactions.minPerPost;
    
    for (let i = 0; i < reactionCountForPost; i++) {
      try {
        const reaction = getRandomElement(enhancedMockData.reactions);
        const consultant = getRandomElement(consultants);
        
        await makeRequest('/reactions', 'POST', {
          data: {
            reaction_type: reaction.type,
            weight: 1, // Assuming a default weight for now
            post: post.id,
            consultant: consultant.id
          }
        });
        
        progress.increment('reactions');
      } catch (error) {
        progress.addError('reactions', error);
        console.error(`❌ Failed to create reaction:`, error.message);
      }
    }
  }
  
  progress.logProgress('reactions', 'Created reactions');
}

async function createComments(posts, consultants, progress) {
  console.log('💬 Creating comments...');
  const currentConfig = getConfigInstance();
  
  for (const post of posts) {
    if (Math.random() > currentConfig.generation.comments.probability) continue;
    
    const commentCountForPost = Math.floor(Math.random() * 
      (currentConfig.generation.comments.maxPerPost - currentConfig.generation.comments.minPerPost + 1)) + 
      currentConfig.generation.comments.minPerPost;
    
    for (let i = 0; i < commentCountForPost; i++) {
      try {
        const comment = 'This is a sample comment. It should be replaced with a more realistic one.';
        const consultant = getRandomElement(consultants);
        
        await makeRequest('/comments', 'POST', {
          data: {
            body: comment,
            post: post.id,
            consultant: consultant.id,
            publishedAt: generateRandomDate().toISOString()
          }
        });
        
        progress.increment('comments');
      } catch (error) {
        progress.addError('comments', error);
        console.error(`❌ Failed to create comment:`, error.message);
      }
    }
  }
  
  progress.logProgress('comments', 'Created comments');
}

async function createSaves(posts, consultants, progress) {
  console.log('🔖 Creating saves...');
  const currentConfig = getConfigInstance();
  
  for (const post of posts) {
    for (const consultant of consultants) {
      if (Math.random() < currentConfig.generation.saves.probability) {
        try {
          await makeRequest('/saves', 'POST', {
            data: {
              post: post.id,
              consultant: consultant.id,
              collection: 'default'
            }
          });
          
          progress.increment('saves');
        } catch (error) {
          progress.addError('saves', error);
          console.error(`❌ Failed to create save:`, error.message);
        }
      }
    }
  }
  
  progress.logProgress('saves', 'Created saves');
}

async function createViews(posts, consultants, progress) {
  console.log('👁️ Creating views...');
  const currentConfig = getConfigInstance();
  
  for (const post of posts) {
    for (const consultant of consultants) {
      if (Math.random() < currentConfig.generation.views.probability) {
        try {
          await makeRequest('/views', 'POST', {
            data: {
              post: post.id,
              consultant: consultant.id,
              view_duration: Math.floor(Math.random() * 
                (currentConfig.generation.views.maxDuration - currentConfig.generation.views.minDuration + 1)) + 
                currentConfig.generation.views.minDuration,
              completion_rate: Math.random() * 100,
              source: getRandomElement(['feed', 'search', 'profile'])
            }
          });
          
          progress.increment('views');
        } catch (error) {
          progress.addError('views', error);
          console.error(`❌ Failed to create view:`, error.message);
        }
      }
    }
  }
  
  progress.logProgress('views', 'Created views');
}

// Main execution function
async function generateMockData() {
  console.log('🚀 Starting enhanced mock data generation...');
  
  const progress = new ProgressTracker();
  const dataLoader = new MockDataLoader();
  
  try {
    // Load existing data if configured
    const existingData = await dataLoader.loadExistingData();
    
    // Create consultants first
    const consultants = await createConsultants(progress);
    console.log(`✅ Created ${consultants.length} consultants`);
    
    // Create properties
    const properties = await createProperties(progress);
    console.log(`✅ Created ${properties.length} properties`);
    
    // Create posts
    const posts = await createPosts(consultants, properties, progress);
    console.log(`✅ Created ${posts.length} posts`);
    
    // Create engagement data (disabled for now - requires user authentication)
    // await createReactions(posts, consultants, progress);
    // await createComments(posts, consultants, progress);
    // await createSaves(posts, consultants, progress);
    // await createViews(posts, consultants, progress);
    console.log('⏭️ Skipping engagement data (requires user authentication)');
    
    // Generate report
    const currentConfig = getConfigInstance();
    if (currentConfig.output.generateReport) {
      progress.generateReport();
    }
    
    console.log('🎉 Enhanced mock data generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Enhanced mock data generation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateMockData();
}

module.exports = {
  generateMockData,
  enhancedMockData,
  ProgressTracker,
  MockDataLoader
};