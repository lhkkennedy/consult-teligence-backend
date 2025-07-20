import { factories } from '@strapi/strapi';
import { getErrorMessage } from '../../../utils/errorHandler';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { user } = ctx.state;
      const postService = strapi.service('api::post.post');
      
      // For seeding purposes, allow posts without author
      const data = {
        ...ctx.request.body,
        ...(user && { author: user.id })
      };

      const post = await postService.create({
        data,
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true
        }
      });

      return ctx.send(post);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to create post', { error: getErrorMessage(error) });
    }
  },

  // Test endpoint to create sample posts
  async createSamplePosts(ctx) {
    try {
      const postService = strapi.service('api::post.post');
      const samplePosts = [
        // Original 10 posts
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
        },
        
        // Additional extended posts
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
        }
      ];

      const createdPosts = [];
      for (let i = 0; i < samplePosts.length; i++) {
        const postData = { ...samplePosts[i] };
        
        // For now, skip property relationships to avoid joinColumn issues
        // TODO: Fix property relationships after database schema is stable
        
        const post = await postService.create({
          data: postData,
          populate: {
            author: true
          }
        });
        createdPosts.push(post);
      }

      return ctx.send({ 
        message: 'Sample posts created successfully', 
        count: createdPosts.length,
        posts: createdPosts 
      });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to create sample posts', { error: getErrorMessage(error) });
    }
  },

  async update(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const postService = strapi.service('api::post.post');
      const post = await postService.findOne(id, {
        populate: {
          author: true
        }
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Check if user is the author
      if ((post as any).author?.id !== user.id) {
        return ctx.forbidden('Not authorized to update this post');
      }

      const updatedPost = await postService.update(id, {
        data: ctx.request.body,
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true
        }
      });

      return ctx.send(updatedPost);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update post', { error: getErrorMessage(error) });
    }
  },

  async delete(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const postService = strapi.service('api::post.post');
      const post = await postService.findOne(id, {
        populate: {
          author: true
        }
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Check if user is the author
      if ((post as any).author?.id !== user.id) {
        return ctx.forbidden('Not authorized to delete this post');
      }

      await postService.delete(id);

      return ctx.send({ message: 'Post deleted successfully' });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to delete post', { error: getErrorMessage(error) });
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const postService = strapi.service('api::post.post');
      const post = await postService.findOne(id, {
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true,
          reactions: true,
          comments: true,
          saves: true,
          shares: true,
          views: true
        }
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Increment view count
      await postService.incrementViewCount(id);

      return ctx.send(post);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch post', { error: getErrorMessage(error) });
    }
  },

  // Test endpoint to attach properties to posts
  async attachPropertiesToPosts(ctx) {
    try {
      const postService = strapi.service('api::post.post');
      const propertyService = strapi.service('api::property.property');
      
      // Get all properties
      const properties = await propertyService.find({
        populate: ['*']
      });
      
      if (!properties.data || properties.data.length === 0) {
        return ctx.badRequest('No properties found. Please create properties first.');
      }
      
      // Get all posts
      const posts = await postService.find({
        populate: ['*']
      });
      
      if (!posts.data || posts.data.length === 0) {
        return ctx.badRequest('No posts found. Please create posts first.');
      }
      
      let attachedCount = 0;
      
      // Attach properties to every 3rd post
      for (let i = 0; i < posts.data.length; i++) {
        if (i % 3 === 0) {
          const post = posts.data[i];
          const propertyIndex = i % properties.data.length;
          const property = properties.data[propertyIndex];
          
          try {
            await postService.update(post.id, {
              data: {
                property: property.id
              },
              populate: {
                property: true
              }
            });
            
            console.log(`✅ Attached property "${property.title}" to post "${post.body_md.substring(0, 50)}..."`);
            attachedCount++;
          } catch (error: unknown) {
            console.error(`❌ Failed to attach property to post ${post.id}:`, (error as Error).message);
          }
        }
      }
      
      return ctx.send({ 
        message: 'Properties attached successfully', 
        attachedCount,
        totalPosts: posts.data.length,
        totalProperties: properties.data.length
      });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to attach properties to posts', { error: getErrorMessage(error) });
    }
  }
}));