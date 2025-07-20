import { factories } from '@strapi/strapi';
import { getErrorMessage } from '../../../utils/errorHandler';

export default factories.createCoreController('api::feed-analytics.feed-analytics-record', ({ strapi }) => ({
  // Default CRUD methods are automatically included
  
  // Custom methods
  async getFeedAnalytics(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { date_range = '7d' } = ctx.query;
      const analytics = await strapi.service('api::feed-analytics.feed-analytics-record').generateFeedAnalytics(user.id, date_range);
      
      return ctx.send(analytics);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to generate feed analytics', { error: getErrorMessage(error) });
    }
  },

  async getMarketInsights(ctx) {
    try {
      const insights = await strapi.service('api::feed-analytics.feed-analytics-record').generateMarketInsights();
      
      return ctx.send(insights);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to generate market insights', { error: getErrorMessage(error) });
    }
  },

  async getTrendingTopics(ctx) {
    try {
      const topics = await strapi.service('api::feed-analytics.feed-analytics-record').calculateTrendingTopics();
      
      return ctx.send(topics);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to get trending topics', { error: getErrorMessage(error) });
    }
  },

  async updateEngagementScores(ctx) {
    try {
      await strapi.service('api::feed-analytics.feed-analytics-record').updateEngagementScores();
      
      return ctx.send({ success: true, message: 'Engagement scores updated successfully' });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update engagement scores', { error: getErrorMessage(error) });
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

      const result = await strapi.service('api::feed-analytics.feed-analytics-record').trackUserActivity(user.id, activity);
      
      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to track activity', { error: getErrorMessage(error) });
    }
  }
}));