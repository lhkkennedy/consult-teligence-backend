import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-preferences.user-preferences', ({ strapi }) => ({
  async getUserPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      if (preferences.length === 0) {
        // Create default preferences
        const defaultPrefs = await strapi.entityService.create('api::user-preferences.user-preferences', {
          data: {
            user: user.id,
            preferred_deal_sizes: ['$100K-$500K', '$500K-$1M', '$1M-$5M'],
            preferred_property_types: ['Residential', 'Commercial', 'Industrial'],
            preferred_locations: ['New York', 'Los Angeles', 'Chicago'],
            preferred_post_types: ['NewListing', 'ProgressUpdate', 'Insight'],
            notifications: {
              new_deals: true,
              market_updates: true,
              mentions: true,
              connection_activity: true,
              deal_updates: true,
              trending_content: true
            },
            privacy: {
              profile_visibility: 'public',
              show_online_status: true,
              allow_messages: true,
              show_activity: true
            },
            algorithm: {
              content_relevance_weight: 0.4,
              connection_weight: 0.3,
              engagement_weight: 0.2,
              recency_weight: 0.1,
              trending_weight: 0.1
            }
          }
        });

        return ctx.send(defaultPrefs);
      }

      return ctx.send(preferences[0]);
    } catch (error) {
      return ctx.badRequest('Failed to get user preferences', { error: error.message });
    }
  },

  async updateUserPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      const updateData = {
        ...ctx.request.body
      };

      let result;
      if (preferences.length === 0) {
        // Create new preferences
        result = await strapi.entityService.create('api::user-preferences.user-preferences', {
          data: {
            ...updateData,
            user: user.id
          }
        });
      } else {
        // Update existing preferences
        result = await strapi.entityService.update('api::user-preferences.user-preferences', preferences[0].id, {
          data: updateData
        });
      }

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to update user preferences', { error: error.message });
    }
  },

  async updateNotificationSettings(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { notifications } = ctx.request.body;

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      if (preferences.length === 0) {
        return ctx.notFound('User preferences not found');
      }

      const result = await strapi.entityService.update('api::user-preferences.user-preferences', preferences[0].id, {
        data: {
          notifications: {
            ...preferences[0].notifications,
            ...notifications
          }
        }
      });

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to update notification settings', { error: error.message });
    }
  },

  async updatePrivacySettings(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { privacy } = ctx.request.body;

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      if (preferences.length === 0) {
        return ctx.notFound('User preferences not found');
      }

      const result = await strapi.entityService.update('api::user-preferences.user-preferences', preferences[0].id, {
        data: {
          privacy: {
            ...preferences[0].privacy,
            ...privacy
          }
        }
      });

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to update privacy settings', { error: error.message });
    }
  },

  async updateAlgorithmPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { algorithm } = ctx.request.body;

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      if (preferences.length === 0) {
        return ctx.notFound('User preferences not found');
      }

      const result = await strapi.entityService.update('api::user-preferences.user-preferences', preferences[0].id, {
        data: {
          algorithm: {
            ...preferences[0].algorithm,
            ...algorithm
          }
        }
      });

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to update algorithm preferences', { error: error.message });
    }
  },

  async resetToDefaults(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const preferences = await strapi.entityService.findMany('api::user-preferences.user-preferences', {
        filters: { user: user.id }
      });

      const defaultPrefs = {
        preferred_deal_sizes: ['$100K-$500K', '$500K-$1M', '$1M-$5M'],
        preferred_property_types: ['Residential', 'Commercial', 'Industrial'],
        preferred_locations: ['New York', 'Los Angeles', 'Chicago'],
        preferred_post_types: ['NewListing', 'ProgressUpdate', 'Insight'],
        notifications: {
          new_deals: true,
          market_updates: true,
          mentions: true,
          connection_activity: true,
          deal_updates: true,
          trending_content: true
        },
        privacy: {
          profile_visibility: 'public',
          show_online_status: true,
          allow_messages: true,
          show_activity: true
        },
        algorithm: {
          content_relevance_weight: 0.4,
          connection_weight: 0.3,
          engagement_weight: 0.2,
          recency_weight: 0.1,
          trending_weight: 0.1
        }
      };

      let result;
      if (preferences.length === 0) {
        result = await strapi.entityService.create('api::user-preferences.user-preferences', {
          data: {
            ...defaultPrefs,
            user: user.id
          }
        });
      } else {
        result = await strapi.entityService.update('api::user-preferences.user-preferences', preferences[0].id, {
          data: defaultPrefs
        });
      }

      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest('Failed to reset preferences to defaults', { error: error.message });
    }
  }
}));