import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::feed-analytics.feed-analytics-record', ({ strapi }) => ({
  async recordUserActivity(userId: string, activity: any) {
    try {
      const feedAnalyticsService = strapi.service('api::feed-analytics.feed-analytics-record');
      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const postService = strapi.service('api::post.post');
      const reactionService = strapi.service('api::reaction.reaction');

      // Find existing record for today
      const today = new Date().toISOString().split('T')[0];
      const existingRecord = await feedAnalyticsService.findMany({
        filters: { 
          user: { id: userId },
          date: today
        }
      });

      let record = existingRecord[0];

      if (!record) {
        // Create new record
        record = await feedAnalyticsService.create({
          data: {
            user: userId,
            date: today as any,
            posts_viewed: 0,
            posts_liked: 0,
            posts_commented: 0,
            posts_shared: 0,
            posts_saved: 0,
            total_time_spent: 0,
            average_session_duration: 0
          }
        });
      }

      // Update metrics based on activity type
      if (activity.type === 'view') {
        record.posts_viewed = (record.posts_viewed || 0) + 1;
        record.total_time_spent = (record.total_time_spent || 0) + (activity.duration || 0);
      } else if (activity.type === 'like') {
        record.posts_liked = (record.posts_liked || 0) + 1;
      } else if (activity.type === 'comment') {
        record.posts_commented = (record.posts_commented || 0) + 1;
      } else if (activity.type === 'share') {
        record.posts_shared = (record.posts_shared || 0) + 1;
      } else if (activity.type === 'save') {
        record.posts_saved = (record.posts_saved || 0) + 1;
      }

      // Update average session duration
      if (activity.session_duration) {
        const currentAvg = record.average_session_duration || 0;
        const currentCount = record.posts_viewed || 1;
        record.average_session_duration = Math.round((currentAvg * (currentCount - 1) + activity.session_duration) / currentCount);
      }

      // Save updated record
      await feedAnalyticsService.update(record.documentId || record.id, {
        data: {
          posts_viewed: record.posts_viewed || 0,
          posts_liked: record.posts_liked || 0,
          posts_commented: record.posts_commented || 0,
          posts_shared: record.posts_shared || 0,
          posts_saved: record.posts_saved || 0,
          total_time_spent: record.total_time_spent || 0,
          average_session_duration: record.average_session_duration || 0
        }
      });

      return record;
    } catch (error) {
      console.error('Error recording user activity:', error);
      throw error;
    }
  },

  async generateFeedAnalytics(userId: string, dateRange: string = '7d') {
    try {
      const feedAnalyticsService = strapi.service('api::feed-analytics.feed-analytics-record');
      const userPreferencesService = strapi.service('api::user-preferences.user-preference');

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

      // Get analytics records for the date range
      const records = await feedAnalyticsService.findMany({
        filters: { 
          user: { id: userId },
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
        daily_activity: [] as any[],
        most_viewed_post_types: [] as string[],
        preferred_deal_sizes: [] as string[],
        preferred_locations: [] as string[],
        most_engaged_authors: [] as string[]
      };

      // Process daily records
      records.forEach((record: any) => {
        aggregated.total_posts_viewed += record.posts_viewed || 0;
        aggregated.total_posts_liked += record.posts_liked || 0;
        aggregated.total_posts_commented += record.posts_commented || 0;
        aggregated.total_posts_shared += record.posts_shared || 0;
        aggregated.total_posts_saved += record.posts_saved || 0;
        aggregated.total_time_spent += record.total_time_spent || 0;

        aggregated.daily_activity.push({
          date: record.date,
          posts_viewed: record.posts_viewed || 0,
          posts_liked: record.posts_liked || 0,
          posts_commented: record.posts_commented || 0,
          posts_shared: record.posts_shared || 0,
          posts_saved: record.posts_saved || 0,
          time_spent: record.total_time_spent || 0
        });
      });

      // Calculate averages
      if (records.length > 0) {
        aggregated.average_session_duration = Math.round(aggregated.total_time_spent / aggregated.total_posts_viewed);
      }

      // Get user preferences for insights
      const userPrefs = await userPreferencesService.findMany({
        filters: { user: { id: userId } }
      });

      if (userPrefs.length > 0) {
        const prefs = userPrefs[0];
        if (prefs) {
          aggregated.most_viewed_post_types = (prefs.preferred_post_types as string[]) || [];
          aggregated.preferred_deal_sizes = (prefs.preferred_deal_sizes as string[]) || [];
          aggregated.preferred_locations = (prefs.preferred_locations as string[]) || [];
        }
      }

      // Get most engaged authors
      aggregated.most_engaged_authors = await this.getMostEngagedAuthors(userId, dateRange);

      return aggregated;
    } catch (error) {
      console.error('Error generating feed analytics:', error);
      throw error;
    }
  },

  async getMostEngagedAuthors(userId: string, dateRange: string) {
    try {
      const postService = strapi.service('api::post.post');
      // Get posts the user has engaged with
      const posts = await postService.findMany({
        filters: {
          $or: [
            { reactions: { user: { id: userId } } },
            { comments: { user: { id: userId } } },
            { saves: { user: { id: userId } } }
          ]
        },
        populate: {
          author: true,
          reactions: true,
          comments: true,
          saves: true
        }
      });

      const authorEngagement: { [key: string]: number } = {};

      posts.forEach((post: any) => {
        if (post.author) {
          const authorId = post.author.id;
          let engagement = 0;

          // Count reactions
          if (post.reactions) {
            engagement += post.reactions.filter((r: any) => r.user === userId).length;
          }

          // Count comments
          if (post.comments) {
            engagement += post.comments.filter((c: any) => c.user === userId).length;
          }

          // Count saves
          if (post.saves) {
            engagement += post.saves.filter((s: any) => s.user === userId).length;
          }

          authorEngagement[authorId] = (authorEngagement[authorId] || 0) + engagement;
        }
      });

      // Sort by engagement and return top authors
      return Object.entries(authorEngagement)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([authorId]) => authorId);
    } catch (error) {
      console.error('Error getting most engaged authors:', error);
      return [];
    }
  },

  async getMarketInsights(userId: string) {
    try {
      const reactionService = strapi.service('api::reaction.reaction');
      // Get user's engagement data
      const reactions = await reactionService.findMany({
        filters: { user: { id: userId } },
        populate: {
          post: {
            populate: ['author']
          }
        }
      });

      const dealSizes: { [key: string]: number } = {};
      const locations: { [key: string]: number } = {};
      const propertyTypes: { [key: string]: number } = {};
      const sentimentCounts = { Bull: 0, Bear: 0, Neutral: 0 };

      reactions.forEach((reaction: any) => {
        if (reaction.post) {
          const post = reaction.post;
          
          if (post.deal_size) {
            dealSizes[post.deal_size] = (dealSizes[post.deal_size] || 0) + 1;
          }
          
          if (post.location) {
            locations[post.location] = (locations[post.location] || 0) + 1;
          }
          
          if (post.property_type) {
            propertyTypes[post.property_type] = (propertyTypes[post.property_type] || 0) + 1;
          }

          if (post.sentiment) {
            sentimentCounts[post.sentiment as keyof typeof sentimentCounts] = 
              (sentimentCounts[post.sentiment as keyof typeof sentimentCounts] || 0) + 1;
          }
        }
      });

      // Get most common preferences
      const mostCommonDealSize = Object.keys(dealSizes).reduce((a, b) => 
        (dealSizes[a] || 0) > (dealSizes[b] || 0) ? a : b
      );
      
      const mostCommonLocation = Object.keys(locations).reduce((a, b) => 
        (locations[a] || 0) > (locations[b] || 0) ? a : b
      );
      
      const mostCommonPropertyType = Object.keys(propertyTypes).reduce((a, b) => 
        (propertyTypes[a] || 0) > (propertyTypes[b] || 0) ? a : b
      );

      const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
        sentimentCounts[a as keyof typeof sentimentCounts] > sentimentCounts[b as keyof typeof sentimentCounts] ? a : b
      );

      return {
        preferred_deal_size: mostCommonDealSize,
        preferred_location: mostCommonLocation,
        preferred_property_type: mostCommonPropertyType,
        market_sentiment: dominantSentiment,
        deal_size_distribution: dealSizes,
        location_distribution: locations,
        property_type_distribution: propertyTypes,
        sentiment_distribution: sentimentCounts
      };
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  }
}));