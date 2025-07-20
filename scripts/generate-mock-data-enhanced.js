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
  if (!config) {
    config = getConfig();
  }
  return config;
}

// Initialize configuration
config = getConfigInstance();

// Configuration
const API_BASE_URL = config.api.baseUrl;
const API_TOKEN = config.api.token;

if (!API_TOKEN) {
  console.error('❌ STRAPI_TOKEN environment variable is required');
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

// Enhanced mock data with more variety
const enhancedMockData = {
  consultants: [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@consultteligence.com',
      phone: '+1-555-0101',
      title: 'Senior Real Estate Consultant',
      company: 'Johnson & Associates',
      location: 'New York, NY',
      expertise: ['Commercial Real Estate', 'Investment Analysis', 'Market Research'],
      bio: 'Sarah is a seasoned real estate professional with over 15 years of experience in commercial property investment and market analysis.',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      availability: 'Available for new projects',
      certifications: ['CCIM', 'CRE'],
      languages: ['English', 'Spanish'],
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@consultteligence.com',
      phone: '+1-555-0102',
      title: 'Investment Strategist',
      company: 'Chen Capital Partners',
      location: 'San Francisco, CA',
      expertise: ['Venture Capital', 'Tech Real Estate', 'Portfolio Management'],
      bio: 'Michael specializes in technology-focused real estate investments and has helped scale numerous proptech companies.',
      linkedin: 'https://linkedin.com/in/michaelchen',
      availability: 'Limited availability',
      certifications: ['CFA', 'MBA'],
      languages: ['English', 'Mandarin'],
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    },
    {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@consultteligence.com',
      phone: '+1-555-0103',
      title: 'Development Director',
      company: 'Rodriguez Development Group',
      location: 'Miami, FL',
      expertise: ['Residential Development', 'Luxury Properties', 'International Markets'],
      bio: 'Emily leads high-end residential development projects across Latin America and the Caribbean.',
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
      availability: 'Available for new projects',
      certifications: ['LEED AP', 'PMI'],
      languages: ['English', 'Spanish', 'Portuguese'],
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    },
    {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@consultteligence.com',
      phone: '+1-555-0104',
      title: 'Industrial Real Estate Specialist',
      company: 'Thompson Industrial Partners',
      location: 'Chicago, IL',
      expertise: ['Industrial Properties', 'Logistics', 'Supply Chain'],
      bio: 'David focuses on industrial real estate investments and has extensive experience in logistics and distribution centers.',
      linkedin: 'https://linkedin.com/in/davidthompson',
      availability: 'Available for new projects',
      certifications: ['SIOR', 'CCIM'],
      languages: ['English'],
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      firstName: 'Lisa',
      lastName: 'Wang',
      email: 'lisa.wang@consultteligence.com',
      phone: '+1-555-0105',
      title: 'Retail Investment Advisor',
      company: 'Wang Retail Advisors',
      location: 'Los Angeles, CA',
      expertise: ['Retail Real Estate', 'E-commerce Impact', 'Consumer Trends'],
      bio: 'Lisa advises on retail real estate investments with deep understanding of e-commerce disruption and consumer behavior.',
      linkedin: 'https://linkedin.com/in/lisawang',
      availability: 'Limited availability',
      certifications: ['CRX', 'MBA'],
      languages: ['English', 'Mandarin'],
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@consultteligence.com',
      phone: '+1-555-0106',
      title: 'Multifamily Investment Manager',
      company: 'Wilson Multifamily Group',
      location: 'Austin, TX',
      expertise: ['Multifamily', 'Student Housing', 'Affordable Housing'],
      bio: 'James manages a diverse portfolio of multifamily properties across the Southwest, specializing in student and affordable housing.',
      linkedin: 'https://linkedin.com/in/jameswilson',
      availability: 'Available for new projects',
      certifications: ['CCIM', 'CAPS'],
      languages: ['English'],
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    },
    {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@consultteligence.com',
      phone: '+1-555-0107',
      title: 'Hospitality Investment Specialist',
      company: 'Garcia Hospitality Partners',
      location: 'Orlando, FL',
      expertise: ['Hospitality', 'Resorts', 'Hotel Development'],
      bio: 'Maria specializes in hospitality investments and has developed luxury resorts throughout Florida and the Caribbean.',
      linkedin: 'https://linkedin.com/in/mariagarcia',
      availability: 'Limited availability',
      certifications: ['CHIA', 'MBA'],
      languages: ['English', 'Spanish'],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    },
    {
      firstName: 'Robert',
      lastName: 'Kim',
      email: 'robert.kim@consultteligence.com',
      phone: '+1-555-0108',
      title: 'Data Center Investment Advisor',
      company: 'Kim Digital Infrastructure',
      location: 'Seattle, WA',
      expertise: ['Data Centers', 'Digital Infrastructure', 'Cloud Computing'],
      bio: 'Robert advises on data center investments and digital infrastructure projects for major cloud providers and enterprises.',
      linkedin: 'https://linkedin.com/in/robertkim',
      availability: 'Available for new projects',
      certifications: ['CDCP', 'MBA'],
      languages: ['English', 'Korean'],
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    }
  ],

  // Enhanced properties with more variety
  properties: [
    {
      title: 'Downtown Tech Hub',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      property_type: 'Office',
      status: 'Under Construction',
      headline_metric: '85% pre-leased',
      deal_size: 75000000,
      irr: 14.2,
      completion_percentage: 85,
      description: 'A state-of-the-art office complex designed for technology companies, featuring flexible workspaces and cutting-edge amenities.',
      images: [
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
      ],
      roles: ['Developer', 'Asset Manager']
    },
    {
      title: 'Riverside Luxury Condos',
      address: '456 Waterfront Blvd, Miami, FL 33101',
      property_type: 'Luxury Residential',
      status: 'Planning',
      headline_metric: 'Planning phase',
      deal_size: 120000000,
      irr: 16.8,
      completion_percentage: 15,
      description: 'Luxury waterfront condominiums with panoramic ocean views, featuring world-class amenities and sustainable design.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      roles: ['Developer', 'Legal Counsel']
    },
    {
      title: 'Logistics Distribution Center',
      address: '789 Industrial Way, Chicago, IL 60601',
      property_type: 'Industrial',
      status: 'Stabilised',
      headline_metric: '5.25% cap rate',
      deal_size: 45000000,
      irr: 12.5,
      completion_percentage: 100,
      description: 'Modern logistics facility strategically located near major transportation hubs, fully leased to national retailers.',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
      ],
      roles: ['Investor', 'Property Manager']
    },
    {
      title: 'Urban Retail Plaza',
      address: '321 Main Street, Los Angeles, CA 90012',
      property_type: 'Retail',
      status: 'Exited',
      headline_metric: 'Sold at 4.8% cap',
      deal_size: 28000000,
      irr: 18.2,
      completion_percentage: 100,
      description: 'Prime urban retail center with high foot traffic, successfully sold to institutional investor.',
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
      ],
      roles: ['Broker', 'Investor']
    },
    {
      title: 'Mixed-Use Development',
      address: '555 City Center Ave, New York, NY 10001',
      property_type: 'Mixed Use',
      status: 'Under Construction',
      headline_metric: '60% complete',
      deal_size: 95000000,
      irr: 13.5,
      completion_percentage: 60,
      description: 'Large-scale mixed-use development combining residential, retail, and office spaces in a transit-oriented location.',
      images: [
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
      ],
      roles: ['Developer', 'General Contractor']
    },
    {
      title: 'Student Housing Complex',
      address: '789 University Blvd, Austin, TX 78701',
      property_type: 'Student Housing',
      status: 'Stabilised',
      headline_metric: '98% occupancy',
      deal_size: 35000000,
      irr: 11.8,
      completion_percentage: 100,
      description: 'Modern student housing complex with premium amenities, located adjacent to major university campus.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      roles: ['Developer', 'Property Manager']
    },
    {
      title: 'Luxury Resort & Spa',
      address: '123 Paradise Island, Orlando, FL 32801',
      property_type: 'Hospitality',
      status: 'Under Construction',
      headline_metric: '40% complete',
      deal_size: 180000000,
      irr: 15.2,
      completion_percentage: 40,
      description: 'World-class luxury resort featuring 300 rooms, spa facilities, and championship golf course.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
      ],
      roles: ['Developer', 'Hotel Operator']
    },
    {
      title: 'Data Center Campus',
      address: '456 Tech Parkway, Seattle, WA 98101',
      property_type: 'Data Center',
      status: 'Planning',
      headline_metric: 'Planning phase',
      deal_size: 250000000,
      irr: 13.8,
      completion_percentage: 10,
      description: 'State-of-the-art data center campus designed for hyperscale cloud providers with redundant power and cooling systems.',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
      ],
      roles: ['Developer', 'Infrastructure Provider']
    }
  ],

  // Enhanced posts with more variety
  posts: [
    {
      post_type: 'NewListing',
      body_md: '🚀 **New Listing Alert!** Downtown Tech Hub is now available for lease. This state-of-the-art office complex is 85% pre-leased and offers flexible workspaces perfect for growing tech companies. Prime location in San Francisco\'s innovation district.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$50M - $100M',
      location: 'San Francisco, CA',
      property_type: 'Office',
      engagement_score: 94,
      is_trending: true,
      is_featured: true,
      read_time: 3,
      tags: ['tech', 'office', 'san-francisco'],
      view_count: 2200,
      share_count: 78,
      save_count: 45,
      deal_stage: 'Lead',
      roi_estimate: '14.2%',
      market_trend: 'Rising'
    },
    {
      post_type: 'ProgressUpdate',
      body_md: '🏗️ **Construction Update:** Riverside Luxury Condos project is progressing well! Foundation work is complete and we\'re starting on the structural framework. On track for Q4 2024 delivery. This will be a game-changer for Miami\'s luxury residential market.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$100M+',
      location: 'Miami, FL',
      property_type: 'Luxury Residential',
      engagement_score: 87,
      is_trending: true,
      is_featured: false,
      read_time: 4,
      tags: ['luxury', 'residential', 'miami'],
      view_count: 1350,
      share_count: 42,
      save_count: 28,
      deal_stage: 'Under Construction',
      roi_estimate: '16.8%',
      market_trend: 'Rising'
    },
    {
      post_type: 'Insight',
      body_md: '💡 **Market Insight:** The rise of remote work is fundamentally changing office space demand. Companies are seeking smaller, more flexible environments that support hybrid work models. This shift is creating opportunities in suburban markets and mixed-use developments.',
      sentiment: 'Neutral',
      visibility: 'Public',
      deal_size: 'Unknown',
      location: 'National',
      property_type: 'Office',
      engagement_score: 89,
      is_trending: true,
      is_featured: true,
      read_time: 5,
      tags: ['remote-work', 'office-trends', 'market-insight'],
      view_count: 1950,
      share_count: 89,
      save_count: 52,
      deal_stage: 'Active',
      roi_estimate: 'Unknown',
      market_trend: 'Changing'
    },
    {
      post_type: 'Closing',
      body_md: '🎉 **Deal Closed!** Successfully completed the sale of Urban Retail Plaza for $28M at a 4.8% cap rate. Great working with the team on this transaction. The property\'s strong cash flow and prime location made it an attractive investment.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$25M - $50M',
      location: 'Los Angeles, CA',
      property_type: 'Retail',
      engagement_score: 96,
      is_trending: true,
      is_featured: true,
      read_time: 2,
      tags: ['retail', 'closing', 'los-angeles'],
      view_count: 2400,
      share_count: 95,
      save_count: 58,
      deal_stage: 'Closed',
      roi_estimate: '18.2%',
      market_trend: 'Rising'
    },
    {
      post_type: 'Property',
      body_md: '🏢 **Property Spotlight:** Logistics Distribution Center - This modern 500,000 sq ft facility is fully leased to national retailers and generating strong cash flow. Located near major transportation hubs with excellent connectivity.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$25M - $50M',
      location: 'Chicago, IL',
      property_type: 'Industrial',
      engagement_score: 82,
      is_trending: false,
      is_featured: false,
      read_time: 4,
      tags: ['industrial', 'logistics', 'chicago'],
      view_count: 890,
      share_count: 31,
      save_count: 19,
      deal_stage: 'Stabilised',
      roi_estimate: '12.5%',
      market_trend: 'Stable'
    },
    {
      post_type: 'NewListing',
      body_md: '🎓 **Student Housing Opportunity:** Premium student housing complex available for acquisition. 98% occupancy with strong rental growth. Located adjacent to major university campus with excellent amenities.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$25M - $50M',
      location: 'Austin, TX',
      property_type: 'Student Housing',
      engagement_score: 76,
      is_trending: false,
      is_featured: false,
      read_time: 3,
      tags: ['student-housing', 'austin', 'multifamily'],
      view_count: 650,
      share_count: 25,
      save_count: 15,
      deal_stage: 'Lead',
      roi_estimate: '11.8%',
      market_trend: 'Stable'
    },
    {
      post_type: 'ProgressUpdate',
      body_md: '🏨 **Resort Development Update:** Luxury Resort & Spa project is 40% complete. The main hotel structure is taking shape and we\'re on schedule for a Q2 2025 opening. This will be the premier destination in the region.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$100M+',
      location: 'Orlando, FL',
      property_type: 'Hospitality',
      engagement_score: 91,
      is_trending: true,
      is_featured: true,
      read_time: 4,
      tags: ['hospitality', 'resort', 'orlando'],
      view_count: 1800,
      share_count: 65,
      save_count: 38,
      deal_stage: 'Under Construction',
      roi_estimate: '15.2%',
      market_trend: 'Rising'
    },
    {
      post_type: 'Insight',
      body_md: '🔌 **Data Center Market Insight:** The exponential growth of cloud computing and AI is driving unprecedented demand for data center capacity. Hyperscale providers are expanding rapidly, creating opportunities for specialized data center investments.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: 'Unknown',
      location: 'National',
      property_type: 'Data Center',
      engagement_score: 88,
      is_trending: true,
      is_featured: false,
      read_time: 6,
      tags: ['data-center', 'cloud-computing', 'ai', 'market-insight'],
      view_count: 1650,
      share_count: 72,
      save_count: 41,
      deal_stage: 'Active',
      roi_estimate: 'Unknown',
      market_trend: 'Rising'
    }
  ],

  // Sample reactions
  reactions: [
    { reaction_type: 'like', weight: 1 },
    { reaction_type: 'love', weight: 2 },
    { reaction_type: 'celebrate', weight: 3 },
    { reaction_type: 'insightful', weight: 4 },
    { reaction_type: 'helpful', weight: 3 }
  ],

  // Sample comments
  comments: [
    'Great location! What\'s the current occupancy rate?',
    'Excellent deal structure. The cap rate looks very attractive.',
    'This is exactly what the market needs right now.',
    'Impressive ROI projections. What\'s driving the upside?',
    'Love the sustainable design features. ESG considerations are key.',
    'Perfect timing for this type of investment.',
    'The location is prime for future appreciation.',
    'Strong tenant mix and lease terms.',
    'This will be a game-changer for the area.',
    'Excellent work on getting this deal done!',
    'The market fundamentals look solid for this asset class.',
    'Great to see more investment in this sector.',
    'The timing couldn\'t be better for this project.',
    'Strong team behind this development.',
    'This aligns perfectly with current market trends.'
  ]
};

// Utility functions
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const currentConfig = getConfigInstance();
    const requestConfig = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      timeout: currentConfig.api.timeout,
      ...(data && { data })
    };
    
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error(`❌ Error making ${method} request to ${endpoint}:`, error.response?.data || error.message);
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
          email: consultant.email,
          phone: consultant.phone,
          title: consultant.title,
          company: consultant.company,
          location: consultant.location,
          expertise: consultant.expertise,
          bio: consultant.bio,
          linkedin: consultant.linkedin,
          availability: consultant.availability,
          certifications: consultant.certifications,
          languages: consultant.languages,
          profileImage: consultant.profileImage
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
  
  for (const property of properties) {
    try {
      if (currentConfig.validation.validateBeforeCreate) {
        validateData(property, 'property');
      }

      const response = await makeRequest('/properties', 'POST', {
        data: {
          title: property.title,
          address: property.address,
          property_type: property.property_type,
          status: property.status,
          headline_metric: property.headline_metric,
          deal_size: property.deal_size,
          irr: property.irr,
          completion_percentage: property.completion_percentage,
          description: property.description,
          images: property.images,
          roles: property.roles
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
  const postsToCreate = currentConfig.generation.posts || enhancedMockData.posts.length;
  const posts = enhancedMockData.posts.slice(0, postsToCreate);
  
  for (const post of posts) {
    try {
      if (currentConfig.validation.validateBeforeCreate) {
        validateData(post, 'post');
      }

      // Assign consultant based on configuration
      let consultant;
      if (currentConfig.relationships.postAssignment === 'round-robin') {
        consultant = consultants[createdPosts.length % consultants.length];
      } else {
        consultant = getRandomElement(consultants);
      }
      
      // Assign property based on configuration
      let property = null;
      if (currentConfig.relationships.propertyAssignment === 'matching' && post.post_type === 'Property') {
        property = getRandomElement(properties);
      } else if (currentConfig.relationships.propertyAssignment === 'random') {
        property = Math.random() < 0.3 ? getRandomElement(properties) : null;
      }
      
      const response = await makeRequest('/posts', 'POST', {
        data: {
          ...post,
          consultant: consultant.id,
          ...(property && { property: property.id }),
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
            reaction_type: reaction.reaction_type,
            weight: reaction.weight,
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
        const comment = getRandomElement(enhancedMockData.comments);
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
    
    // Create engagement data
    await createReactions(posts, consultants, progress);
    await createComments(posts, consultants, progress);
    await createSaves(posts, consultants, progress);
    await createViews(posts, consultants, progress);
    
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