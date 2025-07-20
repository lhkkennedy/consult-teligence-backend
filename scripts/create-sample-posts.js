const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

const samplePosts = [
  {
    post_type: 'NewListing',
    body_md: 'Exciting new listing in downtown! This prime commercial property offers excellent ROI potential with a 6.2% cap rate. Perfect for investors looking for stable income in a growing market.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'New York, NY',
    property_type: 'Office',
    engagement_score: 85,
    is_trending: true,
    is_featured: true,
    read_time: 3,
    tags: [],
    view_count: 1250,
    share_count: 45,
    save_count: 23,
    deal_stage: 'Lead',
    roi_estimate: '12.3%',
    market_trend: 'Rising'
  },
  {
    post_type: 'ProgressUpdate',
    body_md: 'Great progress on the Riverside Development project! We\'ve reached 75% completion and are on track to deliver ahead of schedule. The market response has been phenomenal.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Los Angeles, CA',
    property_type: 'Mixed-Use',
    engagement_score: 92,
    is_trending: true,
    is_featured: true,
    read_time: 4,
    tags: [],
    view_count: 2100,
    share_count: 67,
    save_count: 34,
    deal_stage: 'Under Contract',
    roi_estimate: '15.7%',
    market_trend: 'Rising'
  },
  {
    post_type: 'Insight',
    body_md: 'Market analysis: The commercial real estate sector is showing strong fundamentals despite economic headwinds. Cap rates remain attractive, and we\'re seeing increased institutional interest.',
    sentiment: 'Neutral',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'Chicago, IL',
    property_type: 'Commercial',
    engagement_score: 78,
    is_trending: false,
    is_featured: false,
    read_time: 5,
    tags: [],
    view_count: 890,
    share_count: 28,
    save_count: 15,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Stable'
  },
  {
    post_type: 'Closing',
    body_md: 'Deal closed! Successfully completed the Harborview Retail Center transaction. This represents our largest deal this quarter and demonstrates our team\'s expertise in complex retail transactions.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Miami, FL',
    property_type: 'Retail',
    engagement_score: 95,
    is_trending: true,
    is_featured: true,
    read_time: 2,
    tags: [],
    view_count: 1800,
    share_count: 89,
    save_count: 42,
    deal_stage: 'Closed',
    roi_estimate: '18.2%',
    market_trend: 'Rising'
  },
  {
    post_type: 'NewListing',
    body_md: 'Industrial opportunity alert! This 150,000 sq ft warehouse in the logistics corridor offers excellent potential for e-commerce and distribution companies. Cap rate of 5.8%.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'Dallas, TX',
    property_type: 'Industrial',
    engagement_score: 71,
    is_trending: false,
    is_featured: false,
    read_time: 3,
    tags: [],
    view_count: 650,
    share_count: 19,
    save_count: 12,
    deal_stage: 'Lead',
    roi_estimate: '11.5%',
    market_trend: 'Rising'
  },
  {
    post_type: 'Insight',
    body_md: 'The multifamily market continues to show resilience with strong rental demand and increasing cap rates. Investors are finding value in secondary markets with growing populations.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$10M - $25M',
    location: 'Austin, TX',
    property_type: 'Multifamily',
    engagement_score: 82,
    is_trending: true,
    is_featured: false,
    read_time: 4,
    tags: [],
    view_count: 1100,
    share_count: 35,
    save_count: 18,
    deal_stage: 'Active',
    roi_estimate: '8.5%',
    market_trend: 'Rising'
  },
  {
    post_type: 'ProgressUpdate',
    body_md: 'Construction milestone reached! The luxury condominium project in downtown Seattle has completed the foundation phase ahead of schedule. Pre-sales are exceeding expectations.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Seattle, WA',
    property_type: 'Residential',
    engagement_score: 88,
    is_trending: true,
    is_featured: true,
    read_time: 3,
    tags: [],
    view_count: 1450,
    share_count: 52,
    save_count: 29,
    deal_stage: 'Under Construction',
    roi_estimate: '14.2%',
    market_trend: 'Rising'
  },
  {
    post_type: 'Closing',
    body_md: 'Another successful closing! The medical office building portfolio transaction closed today. This deal represents our continued focus on healthcare real estate investments.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'Phoenix, AZ',
    property_type: 'Medical Office',
    engagement_score: 76,
    is_trending: false,
    is_featured: false,
    read_time: 2,
    tags: [],
    view_count: 720,
    share_count: 22,
    save_count: 11,
    deal_stage: 'Closed',
    roi_estimate: '9.8%',
    market_trend: 'Stable'
  },
  {
    post_type: 'Insight',
    body_md: 'Market volatility is creating opportunities for savvy investors. Distressed assets are coming to market at attractive prices, particularly in the hospitality sector.',
    sentiment: 'Bear',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'Las Vegas, NV',
    property_type: 'Hospitality',
    engagement_score: 69,
    is_trending: false,
    is_featured: false,
    read_time: 6,
    tags: [],
    view_count: 580,
    share_count: 16,
    save_count: 8,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Declining'
  },
  {
    post_type: 'NewListing',
    body_md: 'Premium retail space available in the heart of downtown! This 25,000 sq ft space is perfect for flagship stores or restaurant concepts. High foot traffic location.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$10M - $25M',
    location: 'Denver, CO',
    property_type: 'Retail',
    engagement_score: 79,
    is_trending: false,
    is_featured: false,
    read_time: 3,
    tags: [],
    view_count: 890,
    share_count: 31,
    save_count: 16,
    deal_stage: 'Lead',
    roi_estimate: '7.2%',
    market_trend: 'Stable'
  }
];

async function createSamplePosts() {
  console.log('Creating sample posts...');
  
  try {
    console.log(`Making request to: ${API_BASE_URL}/posts/sample`);
    const response = await axios.post(`${API_BASE_URL}/posts/sample`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      console.log(`✅ Successfully created ${response.data.count} sample posts`);
      console.log('Sample posts creation completed!');
    }
  } catch (error) {
    console.error(`❌ Failed to create sample posts:`);
    console.error(`Status: ${error.response?.status}`);
    console.error(`Status Text: ${error.response?.statusText}`);
    console.error(`Data:`, error.response?.data);
    console.error(`Message: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Please make sure the Strapi server is running on http://localhost:1337');
    }
  }
}

// Run the script
createSamplePosts().catch(console.error); 