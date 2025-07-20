const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';
const API_TOKEN = process.env.STRAPI_TOKEN;

if (!API_TOKEN) {
  console.error('❌ STRAPI_TOKEN environment variable is required');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

// Mock data generators
const mockData = {
  // Consultants/Experts
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
    }
  ],

  // Properties
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
    }
  ],

  // Posts with different types
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
    'Excellent work on getting this deal done!'
  ]
};

// Utility functions
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      ...(data && { data })
    };
    
    const response = await axios(config);
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

// Main functions
async function createConsultants() {
  console.log('👥 Creating consultants...');
  const createdConsultants = [];
  
  for (const consultant of mockData.consultants) {
    try {
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
      console.log(`✅ Created consultant: ${consultant.firstName} ${consultant.lastName}`);
    } catch (error) {
      console.error(`❌ Failed to create consultant ${consultant.firstName} ${consultant.lastName}:`, error.message);
    }
  }
  
  return createdConsultants;
}

async function createProperties() {
  console.log('🏢 Creating properties...');
  const createdProperties = [];
  
  for (const property of mockData.properties) {
    try {
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
      console.log(`✅ Created property: ${property.title}`);
    } catch (error) {
      console.error(`❌ Failed to create property ${property.title}:`, error.message);
    }
  }
  
  return createdProperties;
}

async function createPosts(consultants, properties) {
  console.log('📝 Creating posts...');
  const createdPosts = [];
  
  for (const post of mockData.posts) {
    try {
      // Randomly assign to a consultant
      const consultant = getRandomElement(consultants);
      
      // Randomly assign to a property (if applicable)
      const property = post.post_type === 'Property' ? getRandomElement(properties) : null;
      
      const response = await makeRequest('/posts', 'POST', {
        data: {
          ...post,
          consultant: consultant.id,
          ...(property && { property: property.id }),
          publishedAt: generateRandomDate().toISOString()
        }
      });
      
      createdPosts.push(response.data);
      console.log(`✅ Created post: ${post.post_type} - ${post.body_md.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Failed to create post:`, error.message);
    }
  }
  
  return createdPosts;
}

async function createReactions(posts, consultants) {
  console.log('👍 Creating reactions...');
  let reactionCount = 0;
  
  for (const post of posts) {
    // Create 3-8 random reactions per post
    const reactionCountForPost = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < reactionCountForPost; i++) {
      try {
        const reaction = getRandomElement(mockData.reactions);
        const consultant = getRandomElement(consultants);
        
        await makeRequest('/reactions', 'POST', {
          data: {
            reaction_type: reaction.reaction_type,
            weight: reaction.weight,
            post: post.id,
            consultant: consultant.id
          }
        });
        
        reactionCount++;
      } catch (error) {
        console.error(`❌ Failed to create reaction:`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${reactionCount} reactions`);
}

async function createComments(posts, consultants) {
  console.log('💬 Creating comments...');
  let commentCount = 0;
  
  for (const post of posts) {
    // Create 2-5 random comments per post
    const commentCountForPost = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < commentCountForPost; i++) {
      try {
        const comment = getRandomElement(mockData.comments);
        const consultant = getRandomElement(consultants);
        
        await makeRequest('/comments', 'POST', {
          data: {
            body: comment,
            post: post.id,
            consultant: consultant.id,
            publishedAt: generateRandomDate().toISOString()
          }
        });
        
        commentCount++;
      } catch (error) {
        console.error(`❌ Failed to create comment:`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${commentCount} comments`);
}

async function createSaves(posts, consultants) {
  console.log('🔖 Creating saves...');
  let saveCount = 0;
  
  for (const post of posts) {
    // 20-40% chance of being saved by each consultant
    for (const consultant of consultants) {
      if (Math.random() < 0.3) {
        try {
          await makeRequest('/saves', 'POST', {
            data: {
              post: post.id,
              consultant: consultant.id,
              collection: 'default'
            }
          });
          
          saveCount++;
        } catch (error) {
          console.error(`❌ Failed to create save:`, error.message);
        }
      }
    }
  }
  
  console.log(`✅ Created ${saveCount} saves`);
}

async function createViews(posts, consultants) {
  console.log('👁️ Creating views...');
  let viewCount = 0;
  
  for (const post of posts) {
    // Create views for 60-80% of consultants
    for (const consultant of consultants) {
      if (Math.random() < 0.7) {
        try {
          await makeRequest('/views', 'POST', {
            data: {
              post: post.id,
              consultant: consultant.id,
              view_duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
              completion_rate: Math.random() * 100,
              source: getRandomElement(['feed', 'search', 'profile'])
            }
          });
          
          viewCount++;
        } catch (error) {
          console.error(`❌ Failed to create view:`, error.message);
        }
      }
    }
  }
  
  console.log(`✅ Created ${viewCount} views`);
}

// Main execution function
async function generateMockData() {
  console.log('🚀 Starting mock data generation...');
  
  try {
    // Create consultants first
    const consultants = await createConsultants();
    console.log(`✅ Created ${consultants.length} consultants`);
    
    // Create properties
    const properties = await createProperties();
    console.log(`✅ Created ${properties.length} properties`);
    
    // Create posts
    const posts = await createPosts(consultants, properties);
    console.log(`✅ Created ${posts.length} posts`);
    
    // Create engagement data
    await createReactions(posts, consultants);
    await createComments(posts, consultants);
    await createSaves(posts, consultants);
    await createViews(posts, consultants);
    
    console.log('🎉 Mock data generation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Consultants: ${consultants.length}`);
    console.log(`   - Properties: ${properties.length}`);
    console.log(`   - Posts: ${posts.length}`);
    
  } catch (error) {
    console.error('❌ Mock data generation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateMockData();
}

module.exports = {
  generateMockData,
  mockData
};