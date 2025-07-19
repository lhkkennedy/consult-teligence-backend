import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async getFeed(request: any) {
    const {
      page = 1,
      limit = 20,
      category = 'all',
      sort_by = 'recent',
      filters = {},
      search = '',
      user_id
    } = request;

    const offset = (page - 1) * limit;
    
    // Build query based on category
    let query: any = {
      populate: {
        author: {
          populate: ['consultant']
        },
        property: true,
        media_urls: true,
        tags: true,
        reactions: {
          populate: ['user']
        },
        comments: {
          populate: ['user', 'replies']
        },
        _count: {
          reactions: true,
          comments: true,
          saves: true,
          shares: true,
          views: true
        }
      },
      pagination: {
        start: offset,
        limit
      }
    };

    // Apply filters
    if (filters.post_types?.length) {
      query.filters = { ...query.filters, post_type: { $in: filters.post_types } };
    }
    if (filters.sentiments?.length) {
      query.filters = { ...query.filters, sentiment: { $in: filters.sentiments } };
    }
    if (filters.date_range) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(filters.date_range));
      query.filters = { ...query.filters, createdAt: { $gte: date } };
    }
    if (filters.has_media) {
      query.filters = { ...query.filters, media_urls: { $notNull: true } };
    }
    if (filters.deal_size) {
      query.filters = { ...query.filters, deal_size: filters.deal_size };
    }
    if (filters.location) {
      query.filters = { ...query.filters, location: { $containsi: filters.location } };
    }
    if (filters.property_type?.length) {
      query.filters = { ...query.filters, property_type: { $in: filters.property_type } };
    }

    // Apply search
    if (search) {
      query.filters = {
        ...query.filters,
        $or: [
          { body_md: { $containsi: search } },
          { location: { $containsi: search } },
          { deal_size: { $containsi: search } }
        ]
      };
    }

    // Apply sorting
    switch (sort_by) {
      case 'popular':
        query.sort = { engagement_score: 'desc' };
        break;
      case 'trending':
        query.filters = { ...query.filters, is_trending: true };
        query.sort = { engagement_score: 'desc' };
        break;
      case 'engagement':
        query.sort = { engagement_score: 'desc' };
        break;
      default:
        query.sort = { createdAt: 'desc' };
    }

    // Apply category-specific logic
    switch (category) {
      case 'following':
        // Get user's connections and show their posts
        const userConnections = await this.getUserConnections(user_id);
        query.filters = { ...query.filters, author: { $in: userConnections } };
        break;
      case 'trending':
        query.filters = { ...query.filters, is_trending: true };
        break;
      case 'saved':
        // Get user's saved posts
        const savedPosts = await this.getUserSavedPosts(user_id);
        query.filters = { ...query.filters, id: { $in: savedPosts } };
        break;
      case 'discover':
        // Get personalized recommendations
        query.filters = { ...query.filters, is_featured: true };
        break;
    }

    const posts = await strapi.entityService.findMany('api::post.post', query);
    const total = await strapi.entityService.count('api::post.post', { filters: query.filters });

    // Get recommendations
    const recommendations = await this.getRecommendations(user_id);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      },
      stats: await this.getFeedStats(),
      recommendations
    };
  },

  async getPersonalizedFeed(userId: string, preferences: any) {
    const userPrefs = preferences || await this.getUserPreferences(userId);
    
    let query: any = {
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      },
      sort: { createdAt: 'desc' },
      pagination: { limit: 50 }
    };

    // Apply user preferences
    if (userPrefs?.preferred_post_types?.length) {
      query.filters = { post_type: { $in: userPrefs.preferred_post_types } };
    }
    if (userPrefs?.preferred_locations?.length) {
      query.filters = { ...query.filters, location: { $in: userPrefs.preferred_locations } };
    }
    if (userPrefs?.preferred_deal_sizes?.length) {
      query.filters = { ...query.filters, deal_size: { $in: userPrefs.preferred_deal_sizes } };
    }

    return await strapi.entityService.findMany('api::post.post', query);
  },

  async getTrendingFeed(limit: number = 20) {
    return await strapi.entityService.findMany('api::post.post', {
      filters: { is_trending: true },
      sort: { engagement_score: 'desc' },
      pagination: { limit },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      }
    });
  },

  async getFollowingFeed(userId: string, limit: number = 20) {
    const userConnections = await this.getUserConnections(userId);
    
    return await strapi.entityService.findMany('api::post.post', {
      filters: { author: { $in: userConnections } },
      sort: { createdAt: 'desc' },
      pagination: { limit },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      }
    });
  },

  async getSavedFeed(userId: string, limit: number = 20) {
    const savedPosts = await this.getUserSavedPosts(userId);
    
    return await strapi.entityService.findMany('api::post.post', {
      filters: { id: { $in: savedPosts } },
      sort: { createdAt: 'desc' },
      pagination: { limit },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      }
    });
  },

  async getDiscoverFeed(userId: string, limit: number = 20) {
    return await strapi.entityService.findMany('api::post.post', {
      filters: { is_featured: true },
      sort: { discoverability_score: 'desc' },
      pagination: { limit },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      }
    });
  },

  async refreshFeed(userId: string) {
    // Clear cache and regenerate feed
    await strapi.cache.del(`feed:${userId}`);
    return await this.getPersonalizedFeed(userId, null);
  },

  async getUserConnections(userId: string) {
    // Get user's friends/connections
    const friends = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      }
    });

    return friends.map(friend => 
      friend.user1 === userId ? friend.user2 : friend.user1
    );
  },

  async getUserSavedPosts(userId: string) {
    const saves = await strapi.entityService.findMany('api::save.save', {
      filters: { user: userId },
      populate: ['post']
    });

    return saves.map(save => save.post.id);
  },

  async getUserPreferences(userId: string) {
    const prefs = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
      filters: { user: userId }
    });
    return prefs[0] || null;
  },

  async getRecommendations(userId: string) {
    const userPrefs = await this.getUserPreferences(userId);
    
    return {
      connections: await this.getRecommendedConnections(userId, 5),
      topics: await this.getRecommendedTopics(userId, 10),
      deals: await this.getRecommendedDeals(userId, 5)
    };
  },

  async getRecommendedConnections(userId: string, limit: number) {
    // Simple recommendation based on mutual connections
    const userConnections = await this.getUserConnections(userId);
    const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { id: { $ne: userId } },
      populate: ['consultant']
    });

    return allUsers
      .filter(user => !userConnections.includes(user.id))
      .slice(0, limit);
  },

  async getRecommendedTopics(userId: string, limit: number) {
    const tags = await strapi.entityService.findMany('api::tag.tag', {
      filters: { is_trending: true },
      sort: { usage_count: 'desc' },
      pagination: { limit }
    });

    return tags.map(tag => tag.name);
  },

  async getRecommendedDeals(userId: string, limit: number) {
    return await strapi.entityService.findMany('api::post.post', {
      filters: { 
        post_type: { $in: ['NewListing', 'ProgressUpdate'] },
        is_featured: true 
      },
      sort: { engagement_score: 'desc' },
      pagination: { limit },
      populate: {
        author: { populate: ['consultant'] },
        property: true
      }
    });
  },

  async getFeedStats() {
    const totalPosts = await strapi.entityService.count('api::post.post');
    const newPosts = await strapi.entityService.count('api::post.post', {
      filters: {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });
    const activeDeals = await strapi.entityService.count('api::post.post', {
      filters: { post_type: { $in: ['NewListing', 'ProgressUpdate'] } }
    });
    const trendingTopics = await strapi.entityService.count('api::tag.tag', {
      filters: { is_trending: true }
    });

    return {
      total_posts: totalPosts,
      new_posts: newPosts,
      active_deals: activeDeals,
      trending_topics: trendingTopics
    };
  }
}));