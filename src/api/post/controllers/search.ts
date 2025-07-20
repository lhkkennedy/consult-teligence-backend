import { factories } from '@strapi/strapi';
import { getErrorMessage } from '../../../utils/errorHandler';

export default factories.createCoreController('api::post.post', ({ strapi }) => {
  // Helper methods as private functions
  const searchPosts = async (ctx: any, query: string, filters: any, offset: number, limit: number) => {
    const postService = strapi.service('api::post.post');
    const searchQuery = {
      filters: {
        $or: [
          { body_md: { $containsi: query } },
          { location: { $containsi: query } },
          { deal_size: { $containsi: query } },
          { property_type: { $containsi: query } },
          { seo_title: { $containsi: query } },
          { seo_description: { $containsi: query } }
        ],
        ...filters
      },
      populate: {
        author: true,
        property: true,
        media_urls: true,
        tags: true,
        reactions: true,
        comments: true
      },
      sort: { createdAt: 'desc' as any },
      pagination: {
        start: offset,
        limit: limit
      }
    };

    const posts = await postService.findMany(searchQuery);
    return ctx.send({
      data: posts,
      meta: {
        total: posts.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      }
    });
  };

  const searchUsers = async (ctx: any, query: string, filters: any, offset: number, limit: number) => {
    const userService = strapi.service('plugin::users-permissions.user');
    const searchQuery = {
      filters: {
        $or: [
          { username: { $containsi: query } },
          { email: { $containsi: query } }
        ],
        ...filters
      },
      populate: ['consultant'],
      sort: { createdAt: 'desc' as any },
      pagination: {
        start: offset,
        limit: limit
      }
    };

    const users = await userService.findMany(searchQuery);
    return ctx.send({
      data: users,
      meta: {
        total: users.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      }
    });
  };

  const searchProperties = async (ctx: any, query: string, filters: any, offset: number, limit: number) => {
    const propertyService = strapi.service('api::property.property');
    const searchQuery = {
      filters: {
        $or: [
          { title: { $containsi: query } },
          { description: { $containsi: query } },
          { address: { $containsi: query } },
          { property_type: { $containsi: query } }
        ],
        ...filters
      },
      populate: ['images', 'owner'],
      sort: { createdAt: 'desc' as any },
      pagination: {
        start: offset,
        limit: limit
      }
    };

    const properties = await propertyService.findMany(searchQuery);
    return ctx.send({
      data: properties,
      meta: {
        total: properties.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      }
    });
  };

  const searchDeals = async (ctx: any, query: string, filters: any, offset: number, limit: number) => {
    const postService = strapi.service('api::post.post');
    const searchQuery = {
      filters: {
        $and: [
          {
            $or: [
              { body_md: { $containsi: query } },
              { location: { $containsi: query } },
              { deal_size: { $containsi: query } },
              { property_type: { $containsi: query } }
            ]
          },
          { post_type: { $in: ['NewListing', 'ProgressUpdate'] } },
          ...filters
        ]
      },
      populate: {
        author: true,
        property: true,
        media_urls: true,
        tags: true
      },
      sort: { createdAt: 'desc' as any },
      pagination: {
        start: offset,
        limit: limit
      }
    };

    const deals = await postService.findMany(searchQuery);
    return ctx.send({
      data: deals,
      meta: {
        total: deals.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      }
    });
  };

  const discoverConnections = async (ctx: any, userId: string, limit: number) => {
    const connections = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: {
        id: { $ne: userId }
      },
      populate: ['consultant'],
      sort: { createdAt: 'desc' as any },
      pagination: {
        limit
      }
    });

    return ctx.send({
      type: 'connections',
      results: connections
    });
  };

  const discoverTopics = async (ctx: any, userId: string, limit: number) => {
    const topics = await strapi.entityService.findMany('api::post.post', {
      filters: {
        post_type: 'Insight'
      },
      populate: {
        author: { populate: ['consultant'] },
        tags: true
      },
      sort: { createdAt: 'desc' as any },
      pagination: {
        limit
      }
    });

    return ctx.send({
      type: 'topics',
      results: topics
    });
  };

  const discoverDeals = async (ctx: any, userId: string, limit: number) => {
    const deals = await strapi.entityService.findMany('api::post.post', {
      filters: {
        post_type: { $in: ['NewListing', 'ProgressUpdate', 'Closing'] }
      },
      populate: {
        author: { populate: ['consultant'] },
        property: true
      },
      sort: { createdAt: 'desc' as any },
      pagination: {
        limit
      }
    });

    return ctx.send({
      type: 'deals',
      results: deals
    });
  };

  const discoverTrending = async (ctx: any, userId: string, limit: number) => {
    const trending = await strapi.entityService.findMany('api::post.post', {
      populate: {
        author: { populate: ['consultant'] },
        reactions: { populate: ['user'] },
        comments: { populate: ['user'] }
      },
      sort: { createdAt: 'desc' as any },
      pagination: {
        limit
      }
    });

    return ctx.send({
      type: 'trending',
      results: trending
    });
  };

  return {
    async search(ctx) {
      try {
        const { query, type = 'posts', filters = {}, page = 1, limit = 20 } = ctx.query;

        if (!query) {
          return ctx.badRequest('Search query is required');
        }

        const offset = (Number(page) - 1) * Number(limit);

        switch (type) {
          case 'posts':
            return await searchPosts(ctx, query as string, filters as any, offset, Number(limit));
          case 'users':
            return await searchUsers(ctx, query as string, filters as any, offset, Number(limit));
          case 'properties':
            return await searchProperties(ctx, query as string, filters as any, offset, Number(limit));
          case 'deals':
            return await searchDeals(ctx, query as string, filters as any, offset, Number(limit));
          default:
            return await searchPosts(ctx, query as string, filters as any, offset, Number(limit));
        }
      } catch (error: unknown) {
        return ctx.badRequest('Search failed', { error: getErrorMessage(error) });
      }
    },

    async discover(ctx) {
      try {
        const { user } = ctx.state;
        if (!user) {
          return ctx.unauthorized('User not authenticated');
        }

        const { type = 'connections', limit = 10 } = ctx.query;

        switch (type) {
          case 'connections':
            return await discoverConnections(ctx, user.id, Number(limit));
          case 'topics':
            return await discoverTopics(ctx, user.id, Number(limit));
          case 'deals':
            return await discoverDeals(ctx, user.id, Number(limit));
          case 'trending':
            return await discoverTrending(ctx, user.id, Number(limit));
          default:
            return ctx.badRequest('Invalid discovery type');
        }
      } catch (error: unknown) {
        return ctx.badRequest('Discovery failed', { error: getErrorMessage(error) });
      }
    },

    async discoverTrending(ctx) {
      try {
        const { userId, limit = 10 } = ctx.query;
        
        if (!userId) {
          return ctx.badRequest('User ID is required');
        }

        const postService = strapi.service('api::post.post');
        // Get trending posts based on engagement
        const trendingPosts = await postService.findMany({
          filters: {
            engagement_score: { $gte: 50 }
          },
          populate: {
            author: true,
            property: true,
            tags: true
          },
          sort: { engagement_score: 'desc' as any },
          pagination: { limit: Number(limit) }
        });

        return ctx.send({
          data: trendingPosts,
          meta: {
            total: trendingPosts.length
          }
        });
      } catch (error: unknown) {
        return ctx.badRequest('Failed to discover trending content', { error: getErrorMessage(error) });
      }
    }
  };
});