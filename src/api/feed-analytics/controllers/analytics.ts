import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::feed-analytics.feed-analytics', ({ strapi }) => ({
  async getFeedAnalytics(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { date_range = '7d' } = ctx.query;
      const analytics = await strapi.service('api::feed-analytics.feed-analytics').generateFeedAnalytics(user.id, date_range);
      
      return ctx.send(analytics);
    } catch (error) {
      return ctx.badRequest('Failed to generate feed analytics', { error: error.message });
    }
  },

  async getMarketInsights(ctx) {
    try {
      const insights = await strapi.service('api::feed-analytics.feed-analytics').generateMarketInsights();
      
      return ctx.send(insights);
    } catch (error) {
      return ctx.badRequest('Failed to generate market insights', { error: error.message });
    }
  },

  async getTrendingTopics(ctx) {
    try {
      const topics = await strapi.service('api::feed-analytics.feed-analytics').calculateTrendingTopics();
      
      return ctx.send(topics);
    } catch (error) {
      return ctx.badRequest('Failed to get trending topics', { error: error.message });
    }
  },

  async updateEngagementScores(ctx) {
    try {
      await strapi.service('api::feed-analytics.feed-analytics').updateEngagementScores();
      
      return ctx.send({ success: true, message: 'Engagement scores updated successfully' });
    } catch (error) {
      return ctx.badRequest('Failed to update engagement scores', { error: error.message });
    }
  },

  async trackActivity(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { type, post_id, duration, session_duration } = ctx.request.body;

      if (!type) {
        return ctx.badRequest('Activity type is required');
      }

      const activity = {
        type,
        post_id,
        duration,
        session_duration
      };

      const result = await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, activity);
      
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to track activity', { error: error.message });
    }
  }
}));