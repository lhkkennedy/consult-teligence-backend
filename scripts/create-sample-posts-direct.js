const Strapi = require('@strapi/strapi');

async function createSamplePosts() {
  console.log('Starting Strapi...');
  
  // Initialize Strapi
  const strapi = await Strapi().load();
  
  console.log('Creating sample posts...');
  
  const samplePosts = [
    {
      post_type: 'NewListing',
      body_md: 'Exciting new listing in downtown! This prime commercial property offers excellent ROI potential with a 6.2% cap rate.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$25M - $100M',
      location: 'New York, NY',
      property_type: 'Office',
      engagement_score: 85,
      is_trending: true,
      is_featured: true,
      read_time: 3,
      tags: ['#NewListing', '#Investment', '#Commercial'],
      view_count: 1250,
      share_count: 45,
      save_count: 23,
      deal_stage: 'Lead',
      roi_estimate: '12.3%',
      market_trend: 'Rising',
      media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800']
    },
    {
      post_type: 'ProgressUpdate',
      body_md: 'Great progress on the Riverside Development project! We\'ve reached 75% completion and are on track to deliver ahead of schedule.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$100M+',
      location: 'Los Angeles, CA',
      property_type: 'Mixed-Use',
      engagement_score: 92,
      is_trending: true,
      is_featured: true,
      read_time: 4,
      tags: ['#ProgressUpdate', '#Development', '#Success'],
      view_count: 2100,
      share_count: 67,
      save_count: 34,
      deal_stage: 'Under Contract',
      roi_estimate: '15.7%',
      market_trend: 'Rising',
      media_urls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800']
    },
    {
      post_type: 'Insight',
      body_md: 'Market analysis: The commercial real estate sector is showing strong fundamentals despite economic headwinds. Cap rates remain attractive.',
      sentiment: 'Neutral',
      visibility: 'Public',
      deal_size: 'Unknown',
      location: 'Chicago, IL',
      property_type: 'Commercial',
      engagement_score: 78,
      is_trending: false,
      is_featured: false,
      read_time: 5,
      tags: ['#MarketInsights', '#Analysis', '#Trends'],
      view_count: 890,
      share_count: 28,
      save_count: 15,
      deal_stage: 'Active',
      roi_estimate: 'Unknown',
      market_trend: 'Stable',
      media_urls: []
    },
    {
      post_type: 'Closing',
      body_md: 'Deal closed! Successfully completed the acquisition of the Downtown Plaza. This represents a major milestone for our portfolio.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: '$5M - $25M',
      location: 'Miami, FL',
      property_type: 'Retail',
      engagement_score: 95,
      is_trending: true,
      is_featured: true,
      read_time: 2,
      tags: ['#DealClosed', '#Success', '#Retail'],
      view_count: 1800,
      share_count: 89,
      save_count: 56,
      deal_stage: 'Closed',
      roi_estimate: '18.2%',
      market_trend: 'Rising',
      media_urls: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800']
    },
    {
      post_type: 'Insight',
      body_md: 'The multifamily market continues to show resilience with strong demand and limited supply. Cap rates are compressing in prime locations.',
      sentiment: 'Bull',
      visibility: 'Public',
      deal_size: 'Unknown',
      location: 'San Francisco, CA',
      property_type: 'Residential',
      engagement_score: 82,
      is_trending: true,
      is_featured: false,
      read_time: 6,
      tags: ['#MarketInsights', '#Multifamily', '#Trends'],
      view_count: 1450,
      share_count: 52,
      save_count: 31,
      deal_stage: 'Active',
      roi_estimate: 'Unknown',
      market_trend: 'Rising',
      media_urls: []
    }
  ];

  try {
    const postService = strapi.service('api::post.post');
    const createdPosts = [];
    
    for (const postData of samplePosts) {
      try {
        const post = await postService.create({
          data: postData,
          populate: {
            author: true,
            property: true,
            media_urls: true,
            tags: true
          }
        });
        createdPosts.push(post);
        console.log(`✅ Created post: ${postData.post_type} - ${postData.location}`);
      } catch (error) {
        console.log(`❌ Failed to create post: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Sample posts creation completed!`);
    console.log(`✅ Successfully created: ${createdPosts.length} posts`);
    console.log(`❌ Failed: ${samplePosts.length - createdPosts.length} posts`);
    
    if (createdPosts.length > 0) {
      console.log('\n📊 Created posts:');
      createdPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.post_type} - ${post.location} (ID: ${post.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating sample posts:', error);
  } finally {
    await strapi.destroy();
  }
}

// Run the script
createSamplePosts().catch(console.error); 