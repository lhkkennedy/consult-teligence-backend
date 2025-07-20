import { factories } from '@strapi/strapi';
import { getErrorMessage } from '../../../utils/errorHandler';

export default factories.createCoreController('api::user-preferences.user-preference', ({ strapi }) => ({
  async getUserPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      if (preferences.length === 0) {
        // Create default preferences
        const defaultPrefs = await userPreferencesService.create({
          data: {
            user: user.id,
            preferred_post_types: ['NewListing', 'MarketUpdate', 'ProgressUpdate'],
            preferred_deal_sizes: ['$1M-$5M', '$5M-$10M', '$10M+'],
            preferred_locations: ['New York', 'Los Angeles', 'Miami'],
            preferred_property_types: ['Office', 'Retail', 'Industrial'],
            notifications: {
              email_notifications: true,
              push_notifications: true,
              feed_updates: true,
              market_alerts: true,
              deal_alerts: true
            },
            privacy: {
              profile_visibility: 'public',
              show_activity: true,
              allow_messages: true,
              show_connections: true
            },
            algorithm: {
              content_priority: 'engagement',
              feed_frequency: 'realtime',
              personalization_level: 'high'
            }
          }
        });
        return ctx.send(defaultPrefs);
      }

      return ctx.send(preferences[0]);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to get user preferences', { error: getErrorMessage(error) });
    }
  },

  async updateContentPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { preferred_post_types, preferred_deal_sizes, preferred_locations, preferred_property_types } = ctx.request.body;

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      let result;
      if (preferences.length === 0) {
        // Create new preferences
        result = await userPreferencesService.create({
          data: {
            user: user.id,
            preferred_post_types,
            preferred_deal_sizes,
            preferred_locations,
            preferred_property_types
          }
        });
      } else {
        // Update existing preferences
        const currentPrefs = preferences[0];
        if (!currentPrefs) {
          return ctx.notFound('User preferences not found');
        }
        
        result = await userPreferencesService.update(currentPrefs.documentId || currentPrefs.id, {
          data: {
            preferred_post_types: preferred_post_types || currentPrefs.preferred_post_types,
            preferred_deal_sizes: preferred_deal_sizes || currentPrefs.preferred_deal_sizes,
            preferred_locations: preferred_locations || currentPrefs.preferred_locations,
            preferred_property_types: preferred_property_types || currentPrefs.preferred_property_types
          }
        });
      }

      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update content preferences', { error: getErrorMessage(error) });
    }
  },

  async updateNotificationPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { notifications } = ctx.request.body;
      if (!notifications) {
        return ctx.badRequest('Notification preferences are required');
      }

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      let result;
      if (preferences.length === 0) {
        // Create new preferences
        result = await userPreferencesService.create({
          data: {
            user: user.id,
            notifications
          }
        });
      } else {
        // Update existing preferences
        const currentPrefs = preferences[0];
        if (!currentPrefs) {
          return ctx.notFound('User preferences not found');
        }
        
        result = await userPreferencesService.update(currentPrefs.documentId || currentPrefs.id, {
          data: {
            notifications: {
              ...(currentPrefs.notifications as any || {}),
              ...notifications
            }
          }
        });
      }

      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update notification preferences', { error: getErrorMessage(error) });
    }
  },

  async updatePrivacyPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { privacy } = ctx.request.body;
      if (!privacy) {
        return ctx.badRequest('Privacy preferences are required');
      }

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      let result;
      if (preferences.length === 0) {
        // Create new preferences
        result = await userPreferencesService.create({
          data: {
            user: user.id,
            privacy
          }
        });
      } else {
        // Update existing preferences
        const currentPrefs = preferences[0];
        if (!currentPrefs) {
          return ctx.notFound('User preferences not found');
        }
        
        result = await userPreferencesService.update(currentPrefs.documentId || currentPrefs.id, {
          data: {
            privacy: {
              ...(currentPrefs.privacy as any || {}),
              ...privacy
            }
          }
        });
      }

      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update privacy preferences', { error: getErrorMessage(error) });
    }
  },

  async updateAlgorithmPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { algorithm } = ctx.request.body;
      if (!algorithm) {
        return ctx.badRequest('Algorithm preferences are required');
      }

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      let result;
      if (preferences.length === 0) {
        // Create new preferences
        result = await userPreferencesService.create({
          data: {
            user: user.id,
            algorithm
          }
        });
      } else {
        // Update existing preferences
        const currentPrefs = preferences[0];
        if (!currentPrefs) {
          return ctx.notFound('User preferences not found');
        }
        
        result = await userPreferencesService.update(currentPrefs.documentId || currentPrefs.id, {
          data: {
            algorithm: {
              ...(currentPrefs.algorithm as any || {}),
              ...algorithm
            }
          }
        });
      }

      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to update algorithm preferences', { error: getErrorMessage(error) });
    }
  },

  async resetPreferences(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const userPreferencesService = strapi.service('api::user-preferences.user-preference');
      const preferences = await userPreferencesService.findMany({
        filters: { user: { id: user.id } }
      });

      if (preferences.length === 0) {
        return ctx.notFound('No preferences found to reset');
      }

      const preference = preferences[0];
      if (!preference) {
        return ctx.notFound('User preferences not found');
      }

      // Reset to default values
      const result = await userPreferencesService.update(preference.documentId || preference.id, {
        data: {
          preferred_post_types: ['NewListing', 'MarketUpdate', 'ProgressUpdate'],
          preferred_deal_sizes: ['$1M-$5M', '$5M-$10M', '$10M+'],
          preferred_locations: ['New York', 'Los Angeles', 'Miami'],
          preferred_property_types: ['Office', 'Retail', 'Industrial'],
          notifications: {
            email_notifications: true,
            push_notifications: true,
            feed_updates: true,
            market_alerts: true,
            deal_alerts: true
          },
          privacy: {
            profile_visibility: 'public',
            show_activity: true,
            allow_messages: true,
            show_connections: true
          },
          algorithm: {
            content_priority: 'engagement',
            feed_frequency: 'realtime',
            personalization_level: 'high'
          }
        }
      });

      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to reset preferences', { error: getErrorMessage(error) });
    }
  }
}));