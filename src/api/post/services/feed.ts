import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async generatePersonalizedFeed(userId: string, page: number = 1, limit: number = 20) {
    try {
      const postService = strapi.service('api::post.post');
      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const friendsService = strapi.service('api::friends.friend');

      // Get user preferences
      const userPrefs = await userPreferencesService.findMany({
        filters: { user: { id: userId } }
      });

      const preferences = userPrefs[0] || {
        preferred_post_types: ['NewListing', 'MarketUpdate', 'ProgressUpdate'],
        preferred_deal_sizes: ['$1M-$5M', '$5M-$10M', '$10M+'],
        preferred_locations: ['New York', 'Los Angeles', 'Miami'],
        preferred_property_types: ['Office', 'Retail', 'Industrial']
      };

      // Get user connections (friends)
      const userConnections = await this.getUserConnections(userId);

      // Build feed query
      const feedQuery = {
        filters: {
          $or: [
            // Posts from connections
            { author: { id: { $in: userConnections } } },
            // Posts matching user preferences
            {
              $and: [
                { post_type: { $in: preferences.preferred_post_types } },
                {
                  $or: [
                    { deal_size: { $in: preferences.preferred_deal_sizes } },
                    { location: { $in: preferences.preferred_locations } },
                    { property_type: { $in: preferences.preferred_property_types } }
                  ]
                }
              ]
            },
            // High engagement posts
            { engagement_score: { $gte: 50 } }
          ]
        },
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
        },
        sort: { createdAt: 'desc' as any },
        pagination: {
          page,
          pageSize: limit
        }
      };

      const posts = await postService.findMany(feedQuery);

      // Calculate relevance scores and sort
      const scoredPosts = await Promise.all(
        posts.map(async (post: any) => {
          const relevanceScore = await this.calculateRelevanceScore(post, userId, preferences);
          return { ...post, relevanceScore };
        })
      );

      // Sort by relevance score
      scoredPosts.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

      return {
        data: scoredPosts,
        meta: {
          page,
          pageSize: limit,
          total: scoredPosts.length
        }
      };
    } catch (error) {
      console.error('Error generating personalized feed:', error);
      throw error;
    }
  },

  async generateTrendingFeed(page: number = 1, limit: number = 20) {
    try {
      const postService = strapi.service('api::post.post');
      
      const posts = await postService.findMany({
        filters: {
          engagement_score: { $gte: 30 }
        },
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
        },
        sort: { engagement_score: 'desc' as any },
        pagination: {
          page,
          pageSize: limit
        }
      });

      return {
        data: posts,
        meta: {
          page,
          pageSize: limit,
          total: posts.length
        }
      };
    } catch (error) {
      console.error('Error generating trending feed:', error);
      throw error;
    }
  },

  async generateLatestFeed(page: number = 1, limit: number = 20) {
    try {
      const postService = strapi.service('api::post.post');
      
      const posts = await postService.findMany({
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
        },
        sort: { createdAt: 'desc' as any },
        pagination: {
          page,
          pageSize: limit
        }
      });

      return {
        data: posts,
        meta: {
          page,
          pageSize: limit,
          total: posts.length
        }
      };
    } catch (error) {
      console.error('Error generating latest feed:', error);
      throw error;
    }
  },

  async generateCategoryFeed(category: string, page: number = 1, limit: number = 20) {
    try {
      const postService = strapi.service('api::post.post');
      
      const posts = await postService.findMany({
        filters: {
          post_type: category
        },
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
        },
        sort: { createdAt: 'desc' as any },
        pagination: {
          page,
          pageSize: limit
        }
      });

      return {
        data: posts,
        meta: {
          page,
          pageSize: limit,
          total: posts.length
        }
      };
    } catch (error) {
      console.error('Error generating category feed:', error);
      throw error;
    }
  },

  async getUserConnections(userId: string): Promise<string[]> {
    try {
      const friendsService = strapi.service('api::friends.friend');
      
      // Get user's friends
      const friends = await friendsService.findMany({
        filters: {
          $or: [
            { user1: { id: userId } },
            { user2: { id: userId } }
          ]
        }
      });

      // Extract friend IDs
      return friends.map((friend: any) => 
        friend.user1?.id === userId ? friend.user2?.id : friend.user1?.id
      ).filter(Boolean);
    } catch (error) {
      console.error('Error getting user connections:', error);
      return [];
    }
  },

  async getUserSavedPosts(userId: string): Promise<string[]> {
    try {
      const saveService = strapi.service('api::save.save');
      
      const saves = await saveService.findMany({
        filters: { user: { id: userId } },
        populate: { post: true }
      });

      return saves.map((save: any) => save.post?.id).filter(Boolean);
    } catch (error) {
      console.error('Error getting user saved posts:', error);
      return [];
    }
  },

  async calculateRelevanceScore(post: any, userId: string, preferences: any): Promise<number> {
    let score = 0;

    // Base score from engagement
    score += (post.engagement_score || 0) * 0.1;

    // Connection bonus
    const userConnections = await this.getUserConnections(userId);
    if (userConnections.includes(post.author?.id)) {
      score += 50;
    }

    // Preference matching
    if (preferences.preferred_post_types?.includes(post.post_type)) {
      score += 20;
    }

    if (preferences.preferred_deal_sizes?.includes(post.deal_size)) {
      score += 15;
    }

    if (preferences.preferred_locations?.includes(post.location)) {
      score += 15;
    }

    if (preferences.preferred_property_types?.includes(post.property_type)) {
      score += 15;
    }

    // Recency bonus
    const postAge = Date.now() - new Date(post.createdAt).getTime();
    const daysOld = postAge / (1000 * 60 * 60 * 24);
    if (daysOld < 1) score += 30;
    else if (daysOld < 7) score += 20;
    else if (daysOld < 30) score += 10;

    return Math.round(score);
  },

  async clearUserFeedCache(userId: string) {
    try {
      // Note: Strapi v5 might not have cache API available
      // This is a placeholder for future cache implementation
      console.log(`Clearing feed cache for user: ${userId}`);
    } catch (error) {
      console.error('Error clearing feed cache:', error);
    }
  }
}));