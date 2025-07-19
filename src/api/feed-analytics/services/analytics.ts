import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::feed-analytics.feed-analytics', ({ strapi }) => ({
  async trackUserActivity(userId: string, activity: any) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's analytics record
    let analytics = await strapi.entityService.findMany('api::feed-analytics.feed-analytics', {
      filters: {
        user: userId,
        date: today
      }
    });

    if (analytics.length === 0) {
      analytics = [await strapi.entityService.create('api::feed-analytics.feed-analytics', {
        data: {
          user: userId,
          date: today,
          posts_viewed: 0,
          posts_liked: 0,
          posts_commented: 0,
          posts_shared: 0,
          posts_saved: 0,
          total_time_spent: 0,
          average_session_duration: 0
        }
      })];
    }

    const record = analytics[0];

    // Update based on activity type
    switch (activity.type) {
      case 'view':
        record.posts_viewed += 1;
        record.total_time_spent += activity.duration || 0;
        break;
      case 'reaction':
        record.posts_liked += 1;
        break;
      case 'comment':
        record.posts_commented += 1;
        break;
      case 'share':
        record.posts_shared += 1;
        break;
      case 'save':
        record.posts_saved += 1;
        break;
    }

    // Update average session duration
    if (activity.session_duration) {
      const currentAvg = record.average_session_duration || 0;
      const currentCount = record.posts_viewed || 1;
      record.average_session_duration = Math.round((currentAvg * (currentCount - 1) + activity.session_duration) / currentCount);
    }

    // Update analytics record
    await strapi.entityService.update('api::feed-analytics.feed-analytics', record.id, {
      data: {
        posts_viewed: record.posts_viewed,
        posts_liked: record.posts_liked,
        posts_commented: record.posts_commented,
        posts_shared: record.posts_shared,
        posts_saved: record.posts_saved,
        total_time_spent: record.total_time_spent,
        average_session_duration: record.average_session_duration
      }
    });

    return record;
  },

  async generateFeedAnalytics(userId: string, dateRange: string = '7d') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const analytics = await strapi.entityService.findMany('api::feed-analytics.feed-analytics', {
      filters: {
        user: userId,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      },
      sort: { date: 'asc' }
    });

    // Aggregate data
    const aggregated = {
      total_posts_viewed: 0,
      total_posts_liked: 0,
      total_posts_commented: 0,
      total_posts_shared: 0,
      total_posts_saved: 0,
      total_time_spent: 0,
      average_session_duration: 0,
      daily_activity: [],
      most_viewed_post_types: [],
      most_engaged_authors: [],
      preferred_deal_sizes: [],
      preferred_locations: []
    };

    analytics.forEach(day => {
      aggregated.total_posts_viewed += day.posts_viewed || 0;
      aggregated.total_posts_liked += day.posts_liked || 0;
      aggregated.total_posts_commented += day.posts_commented || 0;
      aggregated.total_posts_shared += day.posts_shared || 0;
      aggregated.total_posts_saved += day.posts_saved || 0;
      aggregated.total_time_spent += day.total_time_spent || 0;

      aggregated.daily_activity.push({
        date: day.date,
        posts_viewed: day.posts_viewed || 0,
        posts_liked: day.posts_liked || 0,
        posts_commented: day.posts_commented || 0,
        posts_shared: day.posts_shared || 0,
        posts_saved: day.posts_saved || 0,
        time_spent: day.total_time_spent || 0
      });
    });

    // Calculate averages
    if (analytics.length > 0) {
      aggregated.average_session_duration = Math.round(aggregated.total_time_spent / aggregated.total_posts_viewed);
    }

    // Get user preferences and recommendations
    const userPrefs = await this.getUserPreferences(userId);
    if (userPrefs) {
      aggregated.most_viewed_post_types = userPrefs.preferred_post_types || [];
      aggregated.preferred_deal_sizes = userPrefs.preferred_deal_sizes || [];
      aggregated.preferred_locations = userPrefs.preferred_locations || [];
    }

    // Get most engaged authors
    aggregated.most_engaged_authors = await this.getMostEngagedAuthors(userId, dateRange);

    return aggregated;
  },

  async generateMarketInsights() {
    // Get overall market sentiment
    const posts = await strapi.entityService.findMany('api::post.post', {
      filters: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      populate: ['sentiment', 'deal_size', 'location', 'property_type']
    });

    const sentimentCounts = { Bull: 0, Bear: 0, Neutral: 0 };
    const dealSizes = {};
    const locations = {};
    const propertyTypes = {};

    posts.forEach(post => {
      if (post.sentiment) {
        sentimentCounts[post.sentiment] = (sentimentCounts[post.sentiment] || 0) + 1;
      }
      if (post.deal_size) {
        dealSizes[post.deal_size] = (dealSizes[post.deal_size] || 0) + 1;
      }
      if (post.location) {
        locations[post.location] = (locations[post.location] || 0) + 1;
      }
      if (post.property_type) {
        propertyTypes[post.property_type] = (propertyTypes[post.property_type] || 0) + 1;
      }
    });

    const totalPosts = posts.length;
    const overallSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
      sentimentCounts[a] > sentimentCounts[b] ? a : b
    );

    const sentimentScore = sentimentCounts.Bull - sentimentCounts.Bear;

    // Get trending topics
    const trendingTopics = await this.calculateTrendingTopics();

    // Get active deals
    const activeDeals = await strapi.entityService.count('api::post.post', {
      filters: {
        post_type: { $in: ['NewListing', 'ProgressUpdate'] },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    // Calculate average deal size
    const dealSizeValues = Object.keys(dealSizes).map(size => {
      const value = size.replace(/[^0-9]/g, '');
      return parseInt(value) || 0;
    });
    const avgDealSize = dealSizeValues.length > 0 ? 
      Math.round(dealSizeValues.reduce((a, b) => a + b, 0) / dealSizeValues.length) : 0;

    // Get top markets
    const topMarkets = Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location]) => location);

    return {
      sentiment: {
        overall: overallSentiment,
        score: sentimentScore,
        trend: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral',
        breakdown: sentimentCounts
      },
      trends: {
        topics: trendingTopics,
        deal_sizes: dealSizes,
        locations: locations,
        property_types: propertyTypes
      },
      insights: {
        active_deals: activeDeals,
        avg_deal_size: `$${avgDealSize.toLocaleString()}K`,
        top_markets: topMarkets,
        emerging_opportunities: await this.getEmergingOpportunities()
      }
    };
  },

  async calculateTrendingTopics() {
    const tags = await strapi.entityService.findMany('api::tag.tag', {
      filters: { is_trending: true },
      sort: { usage_count: 'desc' },
      pagination: { limit: 10 }
    });

    return tags.map(tag => tag.name);
  },

  async updateEngagementScores() {
    const posts = await strapi.entityService.findMany('api::post.post', {
      populate: ['reactions', 'comments', 'saves', 'shares', 'views']
    });

    for (const post of posts) {
      await strapi.service('api::post.post').calculateEngagementScore(post.id);
    }
  },

  async getMostEngagedAuthors(userId: string, dateRange: string) {
    // Get posts the user has engaged with
    const userReactions = await strapi.entityService.findMany('api::reaction.reaction', {
      filters: { user: userId },
      populate: ['post.author']
    });

    const authorEngagement = {};
    userReactions.forEach(reaction => {
      if (reaction.post?.author) {
        const authorId = reaction.post.author.id;
        authorEngagement[authorId] = (authorEngagement[authorId] || 0) + 1;
      }
    });

    return Object.entries(authorEngagement)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([authorId]) => authorId);
  },

  async getEmergingOpportunities() {
    // Find posts with high engagement but not yet trending
    const posts = await strapi.entityService.findMany('api::post.post', {
      filters: {
        is_trending: false,
        engagement_score: { $gte: 50 },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      sort: { engagement_score: 'desc' },
      pagination: { limit: 5 }
    });

    return posts.map(post => ({
      id: post.id,
      title: post.seo_title || post.body_md?.substring(0, 100),
      location: post.location,
      deal_size: post.deal_size,
      engagement_score: post.engagement_score
    }));
  },

  async getUserPreferences(userId: string) {
    const prefs = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
      filters: { user: userId }
    });
    return prefs[0] || null;
  }
}));