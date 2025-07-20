const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

const extendedSamplePosts = [
  // Additional New Listings
  {
    post_type: 'NewListing',
    body_md: 'Luxury waterfront condominiums now available! These premium units offer stunning ocean views and world-class amenities. Perfect for high-net-worth investors seeking luxury residential investments.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Miami Beach, FL',
    property_type: 'Luxury Residential',
    engagement_score: 94,
    is_trending: true,
    is_featured: true,
    read_time: 4,
    tags: [],
    view_count: 2200,
    share_count: 78,
    save_count: 45,
    deal_stage: 'Lead',
    roi_estimate: '16.5%',
    market_trend: 'Rising'
  },
  {
    post_type: 'NewListing',
    body_md: 'Data center opportunity in the heart of Silicon Valley! This state-of-the-art facility offers excellent connectivity and is perfect for tech companies expanding their infrastructure.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'San Jose, CA',
    property_type: 'Data Center',
    engagement_score: 87,
    is_trending: true,
    is_featured: false,
    read_time: 5,
    tags: [],
    view_count: 1350,
    share_count: 42,
    save_count: 28,
    deal_stage: 'Lead',
    roi_estimate: '13.8%',
    market_trend: 'Rising'
  },
  {
    post_type: 'NewListing',
    body_md: 'Historic office building in downtown Boston available for redevelopment. This landmark property offers incredible potential for adaptive reuse or luxury office conversion.',
    sentiment: 'Neutral',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'Boston, MA',
    property_type: 'Historic Office',
    engagement_score: 73,
    is_trending: false,
    is_featured: false,
    read_time: 6,
    tags: [],
    view_count: 680,
    share_count: 18,
    save_count: 12,
    deal_stage: 'Lead',
    roi_estimate: '10.2%',
    market_trend: 'Stable'
  },

  // Additional Progress Updates
  {
    post_type: 'ProgressUpdate',
    body_md: 'Major milestone achieved! The sustainable office complex has received LEED Platinum certification. This green building is setting new standards for environmentally conscious commercial development.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Portland, OR',
    property_type: 'Green Office',
    engagement_score: 91,
    is_trending: true,
    is_featured: true,
    read_time: 4,
    tags: [],
    view_count: 1680,
    share_count: 65,
    save_count: 38,
    deal_stage: 'Under Construction',
    roi_estimate: '12.7%',
    market_trend: 'Rising'
  },
  {
    post_type: 'ProgressUpdate',
    body_md: 'Renovation update: The historic hotel transformation is 60% complete. We\'ve successfully preserved the building\'s architectural integrity while modernizing all systems and amenities.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'New Orleans, LA',
    property_type: 'Historic Hotel',
    engagement_score: 85,
    is_trending: false,
    is_featured: false,
    read_time: 3,
    tags: [],
    view_count: 920,
    share_count: 29,
    save_count: 17,
    deal_stage: 'Under Renovation',
    roi_estimate: '11.4%',
    market_trend: 'Stable'
  },

  // Additional Insights
  {
    post_type: 'Insight',
    body_md: 'The rise of remote work is fundamentally changing office space demand. Companies are seeking flexible, amenity-rich environments that support hybrid work models and employee collaboration.',
    sentiment: 'Neutral',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'San Francisco, CA',
    property_type: 'Office',
    engagement_score: 89,
    is_trending: true,
    is_featured: true,
    read_time: 7,
    tags: [],
    view_count: 1950,
    share_count: 89,
    save_count: 52,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Changing'
  },
  {
    post_type: 'Insight',
    body_md: 'ESG considerations are becoming increasingly important in real estate investment decisions. Properties with strong environmental credentials are commanding premium valuations.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'Seattle, WA',
    property_type: 'Sustainable',
    engagement_score: 82,
    is_trending: true,
    is_featured: false,
    read_time: 5,
    tags: [],
    view_count: 1250,
    share_count: 45,
    save_count: 23,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Rising'
  },
  {
    post_type: 'Insight',
    body_md: 'The logistics and e-commerce boom is driving unprecedented demand for last-mile delivery facilities. Urban infill sites are becoming increasingly valuable for distribution centers.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'Atlanta, GA',
    property_type: 'Logistics',
    engagement_score: 76,
    is_trending: false,
    is_featured: false,
    read_time: 6,
    tags: [],
    view_count: 890,
    share_count: 31,
    save_count: 19,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Rising'
  },

  // Additional Closings
  {
    post_type: 'Closing',
    body_md: 'Blockbuster deal closed! Successfully completed the acquisition of a 500-unit multifamily portfolio across three states. This represents our largest multifamily transaction to date.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Multi-State',
    property_type: 'Multifamily Portfolio',
    engagement_score: 96,
    is_trending: true,
    is_featured: true,
    read_time: 3,
    tags: [],
    view_count: 2400,
    share_count: 95,
    save_count: 58,
    deal_stage: 'Closed',
    roi_estimate: '9.8%',
    market_trend: 'Rising'
  },
  {
    post_type: 'Closing',
    body_md: 'Successful exit of our student housing investment! The property was sold to a major REIT at a 22% premium to our initial investment, demonstrating strong value creation.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$10M - $25M',
    location: 'Ann Arbor, MI',
    property_type: 'Student Housing',
    engagement_score: 84,
    is_trending: false,
    is_featured: false,
    read_time: 2,
    tags: [],
    view_count: 780,
    share_count: 25,
    save_count: 14,
    deal_stage: 'Closed',
    roi_estimate: '22.0%',
    market_trend: 'Rising'
  },

  // Bear Market Insights
  {
    post_type: 'Insight',
    body_md: 'Rising interest rates are putting pressure on cap rates across all property types. Investors should expect some price adjustments in the coming quarters as the market adapts.',
    sentiment: 'Bear',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'National',
    property_type: 'All Types',
    engagement_score: 71,
    is_trending: false,
    is_featured: false,
    read_time: 4,
    tags: [],
    view_count: 650,
    share_count: 22,
    save_count: 11,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Declining'
  },
  {
    post_type: 'Insight',
    body_md: 'The retail apocalypse continues as traditional brick-and-mortar stores struggle. However, this is creating opportunities for adaptive reuse and mixed-use redevelopment projects.',
    sentiment: 'Bear',
    visibility: 'Public',
    deal_size: 'Unknown',
    location: 'National',
    property_type: 'Retail',
    engagement_score: 68,
    is_trending: false,
    is_featured: false,
    read_time: 5,
    tags: [],
    view_count: 520,
    share_count: 18,
    save_count: 9,
    deal_stage: 'Active',
    roi_estimate: 'Unknown',
    market_trend: 'Declining'
  },

  // Emerging Markets
  {
    post_type: 'NewListing',
    body_md: 'Emerging market opportunity in Nashville! This rapidly growing city offers excellent potential for multifamily development with strong job growth and demographic trends.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$25M - $100M',
    location: 'Nashville, TN',
    property_type: 'Multifamily',
    engagement_score: 81,
    is_trending: true,
    is_featured: false,
    read_time: 4,
    tags: [],
    view_count: 1100,
    share_count: 38,
    save_count: 21,
    deal_stage: 'Lead',
    roi_estimate: '8.9%',
    market_trend: 'Rising'
  },
  {
    post_type: 'ProgressUpdate',
    body_md: 'Exciting progress on our first international development! The mixed-use project in Toronto is moving forward with strong pre-leasing activity and construction on schedule.',
    sentiment: 'Bull',
    visibility: 'Public',
    deal_size: '$100M+',
    location: 'Toronto, Canada',
    property_type: 'Mixed-Use',
    engagement_score: 88,
    is_trending: true,
    is_featured: true,
    read_time: 3,
    tags: [],
    view_count: 1350,
    share_count: 48,
    save_count: 26,
    deal_stage: 'Under Construction',
    roi_estimate: '11.2%',
    market_trend: 'Rising'
  }
];

async function createExtendedSamplePosts() {
  console.log('Creating extended sample posts...');
  
  try {
    console.log(`Making request to: ${API_BASE_URL}/posts/sample`);
    const response = await axios.post(`${API_BASE_URL}/posts/sample`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      console.log(`✅ Successfully created ${response.data.count} sample posts`);
      console.log('Extended sample posts creation completed!');
    }
  } catch (error) {
    console.error(`❌ Failed to create extended sample posts:`);
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
createExtendedSamplePosts().catch(console.error); 