import { factories } from '@strapi/strapi';
import { getErrorMessage } from '../../../utils/errorHandler';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async getFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const request = {
        ...ctx.query,
        user_id: user.id
      };

      const result = await strapi.service('api::post.post').getFeed(request);
      
      return ctx.send(result);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch feed', { error: getErrorMessage(error) });
    }
  },

  async getPersonalizedFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { preferences } = ctx.query;
      const posts = await strapi.service('api::post.post').getPersonalizedFeed(user.id, preferences);
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch personalized feed', { error: getErrorMessage(error) });
    }
  },

  async getTrendingFeed(ctx) {
    try {
      const { limit = 20 } = ctx.query;
      const posts = await strapi.service('api::post.post').getTrendingFeed(parseInt(limit as string));
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch trending feed', { error: getErrorMessage(error) });
    }
  },

  async getFollowingFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { limit = 20 } = ctx.query;
      const posts = await strapi.service('api::post.post').getFollowingFeed(user.id, parseInt(limit as string));
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch following feed', { error: getErrorMessage(error) });
    }
  },

  async getSavedFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { limit = 20 } = ctx.query;
      const posts = await strapi.service('api::post.post').getSavedFeed(user.id, parseInt(limit as string));
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch saved feed', { error: getErrorMessage(error) });
    }
  },

  async getDiscoverFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { limit = 20 } = ctx.query;
      const posts = await strapi.service('api::post.post').getDiscoverFeed(user.id, parseInt(limit as string));
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to fetch discover feed', { error: getErrorMessage(error) });
    }
  },

  async refreshFeed(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const posts = await strapi.service('api::post.post').refreshFeed(user.id);
      
      return ctx.send(posts);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to refresh feed', { error: getErrorMessage(error) });
    }
  },

  async addReaction(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const { reaction_type } = ctx.request.body;

      if (!reaction_type) {
        return ctx.badRequest('Reaction type is required');
      }

      const reaction = await strapi.service('api::post.post').addReaction(id, user.id, reaction_type);
      
      // Track analytics
      await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, {
        type: 'reaction',
        post_id: id
      });

      return ctx.send(reaction);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to add reaction', { error: getErrorMessage(error) });
    }
  },

  async removeReaction(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      await strapi.service('api::post.post').removeReaction(id, user.id);
      
      return ctx.send({ success: true });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to remove reaction', { error: getErrorMessage(error) });
    }
  },

  async addComment(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const { body, parent_comment_id } = ctx.request.body;

      if (!body) {
        return ctx.badRequest('Comment body is required');
      }

      const comment = await strapi.service('api::post.post').addComment(id, user.id, body, parent_comment_id);
      
      // Track analytics
      await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, {
        type: 'comment',
        post_id: id
      });

      return ctx.send(comment);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to add comment', { error: getErrorMessage(error) });
    }
  },

  async savePost(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const { collection, notes } = ctx.request.body;

      const save = await strapi.service('api::post.post').savePost(id, user.id, collection, notes);
      
      // Track analytics
      await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, {
        type: 'save',
        post_id: id
      });

      return ctx.send(save);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to save post', { error: getErrorMessage(error) });
    }
  },

  async unsavePost(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      await strapi.service('api::post.post').unsavePost(id, user.id);
      
      return ctx.send({ success: true });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to unsave post', { error: getErrorMessage(error) });
    }
  },

  async sharePost(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const { share_type, recipient_email, message } = ctx.request.body;

      if (!share_type) {
        return ctx.badRequest('Share type is required');
      }

      const share = await strapi.service('api::post.post').sharePost(id, user.id, share_type, recipient_email, message);
      
      // Track analytics
      await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, {
        type: 'share',
        post_id: id
      });

      return ctx.send(share);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to share post', { error: getErrorMessage(error) });
    }
  },

  async trackView(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const { duration } = ctx.request.body;

      await strapi.service('api::post.post').trackView(id, user.id, duration);
      
      // Track analytics
      await strapi.service('api::feed-analytics.feed-analytics').trackUserActivity(user.id, {
        type: 'view',
        post_id: id,
        duration
      });

      return ctx.send({ success: true });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to track view', { error: getErrorMessage(error) });
    }
  },

  async getPostEngagement(ctx) {
    try {
      const { id } = ctx.params;
      const engagement = await strapi.service('api::post.post').getPostEngagement(id);
      
      return ctx.send(engagement);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to get post engagement', { error: getErrorMessage(error) });
    }
  },

  async getUserReaction(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const reaction = await strapi.service('api::post.post').getUserReaction(id, user.id);
      
      return ctx.send(reaction);
    } catch (error: unknown) {
      return ctx.badRequest('Failed to get user reaction', { error: getErrorMessage(error) });
    }
  },

  async isPostSaved(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const isSaved = await strapi.service('api::post.post').isPostSaved(id, user.id);
      
      return ctx.send({ isSaved });
    } catch (error: unknown) {
      return ctx.badRequest('Failed to check if post is saved', { error: getErrorMessage(error) });
    }
  }
}));