import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async search(ctx) {
    try {
      const { query, type = 'posts', filters = {}, page = 1, limit = 20 } = ctx.query;

      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const offset = (page - 1) * limit;

      switch (type) {
        case 'posts':
          return await this.searchPosts(ctx, query, filters, offset, limit);
        case 'users':
          return await this.searchUsers(ctx, query, filters, offset, limit);
        case 'properties':
          return await this.searchProperties(ctx, query, filters, offset, limit);
        case 'deals':
          return await this.searchDeals(ctx, query, filters, offset, limit);
        default:
          return ctx.badRequest('Invalid search type');
      }
    } catch (error) {
      return ctx.badRequest('Search failed', { error: error.message });
    }
  },

  async searchPosts(ctx, query, filters, offset, limit) {
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
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true,
        reactions: { populate: ['user'] },
        comments: { populate: ['user', 'replies'] }
      },
      sort: { createdAt: 'desc' },
      pagination: {
        start: offset,
        limit
      }
    };

    const posts = await strapi.entityService.findMany('api::post.post', searchQuery);
    const total = await strapi.entityService.count('api::post.post', { filters: searchQuery.filters });

    return ctx.send({
      type: 'posts',
      query,
      results: posts,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  },

  async searchUsers(ctx, query, filters, offset, limit) {
    const searchQuery = {
      filters: {
        $or: [
          { username: { $containsi: query } },
          { email: { $containsi: query } }
        ],
        ...filters
      },
      populate: ['consultant'],
      sort: { createdAt: 'desc' },
      pagination: {
        start: offset,
        limit
      }
    };

    const users = await strapi.entityService.findMany('plugin::users-permissions.user', searchQuery);
    const total = await strapi.entityService.count('plugin::users-permissions.user', { filters: searchQuery.filters });

    return ctx.send({
      type: 'users',
      query,
      results: users,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  },

  async searchProperties(ctx, query, filters, offset, limit) {
    const searchQuery = {
      filters: {
        $or: [
          { name: { $containsi: query } },
          { address: { $containsi: query } },
          { description: { $containsi: query } }
        ],
        ...filters
      },
      populate: ['owner', 'consultant'],
      sort: { createdAt: 'desc' },
      pagination: {
        start: offset,
        limit
      }
    };

    const properties = await strapi.entityService.findMany('api::property.property', searchQuery);
    const total = await strapi.entityService.count('api::property.property', { filters: searchQuery.filters });

    return ctx.send({
      type: 'properties',
      query,
      results: properties,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  },

  async searchDeals(ctx, query, filters, offset, limit) {
    const searchQuery = {
      filters: {
        post_type: { $in: ['NewListing', 'ProgressUpdate', 'Closing'] },
        $or: [
          { body_md: { $containsi: query } },
          { location: { $containsi: query } },
          { deal_size: { $containsi: query } },
          { property_type: { $containsi: query } }
        ],
        ...filters
      },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true
      },
      sort: { createdAt: 'desc' },
      pagination: {
        start: offset,
        limit
      }
    };

    const deals = await strapi.entityService.findMany('api::post.post', searchQuery);
    const total = await strapi.entityService.count('api::post.post', { filters: searchQuery.filters });

    return ctx.send({
      type: 'deals',
      query,
      results: deals,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
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
          return await this.discoverConnections(ctx, user.id, limit);
        case 'topics':
          return await this.discoverTopics(ctx, user.id, limit);
        case 'deals':
          return await this.discoverDeals(ctx, user.id, limit);
        case 'trending':
          return await this.discoverTrending(ctx, user.id, limit);
        default:
          return ctx.badRequest('Invalid discovery type');
      }
    } catch (error) {
      return ctx.badRequest('Discovery failed', { error: error.message });
    }
  },

  async discoverConnections(ctx, userId, limit) {
    const userConnections = await strapi.service('api::post.post').getUserConnections(userId);
    
    const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { id: { $ne: userId } },
      populate: ['consultant'],
      pagination: { limit: parseInt(limit) }
    });

    const recommendations = allUsers
      .filter(user => !userConnections.includes(user.id))
      .slice(0, parseInt(limit));

    return ctx.send({
      type: 'connections',
      recommendations
    });
  },

  async discoverTopics(ctx, userId, limit) {
    const tags = await strapi.entityService.findMany('api::tag.tag', {
      filters: { is_trending: true },
      sort: { usage_count: 'desc' },
      pagination: { limit: parseInt(limit) }
    });

    return ctx.send({
      type: 'topics',
      recommendations: tags.map(tag => tag.name)
    });
  },

  async discoverDeals(ctx, userId, limit) {
    const deals = await strapi.entityService.findMany('api::post.post', {
      filters: { 
        post_type: { $in: ['NewListing', 'ProgressUpdate'] },
        is_featured: true 
      },
      sort: { engagement_score: 'desc' },
      pagination: { limit: parseInt(limit) },
      populate: {
        author: { populate: ['consultant'] },
        property: true
      }
    });

    return ctx.send({
      type: 'deals',
      recommendations: deals
    });
  },

  async discoverTrending(ctx, userId, limit) {
    const trending = await strapi.entityService.findMany('api::post.post', {
      filters: { is_trending: true },
      sort: { engagement_score: 'desc' },
      pagination: { limit: parseInt(limit) },
      populate: {
        author: { populate: ['consultant'] },
        property: true,
        media_urls: true,
        tags: true
      }
    });

    return ctx.send({
      type: 'trending',
      recommendations: trending
    });
  }
}));