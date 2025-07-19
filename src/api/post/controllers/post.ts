import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const data = {
        ...ctx.request.body,
        author: user.id
      };

      const post = await strapi.entityService.create('api::post.post', {
        data,
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true
        }
      });

      return ctx.send(post);
    } catch (error) {
      return ctx.badRequest('Failed to create post', { error: error.message });
    }
  },

  async find(ctx) {
    try {
      const { query } = ctx;
      const posts = await strapi.entityService.findMany('api::post.post', {
        ...query,
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true,
          reactions: { populate: ['user'] },
          comments: { populate: ['user', 'replies'] }
        }
      });

      return ctx.send(posts);
    } catch (error) {
      return ctx.badRequest('Failed to fetch posts', { error: error.message });
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const post = await strapi.entityService.findOne('api::post.post', id, {
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true,
          reactions: { populate: ['user'] },
          comments: { populate: ['user', 'replies'] },
          saves: { populate: ['user'] },
          shares: { populate: ['user'] },
          views: { populate: ['user'] }
        }
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      return ctx.send(post);
    } catch (error) {
      return ctx.badRequest('Failed to fetch post', { error: error.message });
    }
  },

  async update(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const post = await strapi.entityService.findOne('api::post.post', id);

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Check if user is the author
      if (post.author?.id !== user.id) {
        return ctx.forbidden('You can only edit your own posts');
      }

      const updatedPost = await strapi.entityService.update('api::post.post', id, {
        data: ctx.request.body,
        populate: {
          author: { populate: ['consultant'] },
          property: true,
          media_urls: true,
          tags: true
        }
      });

      return ctx.send(updatedPost);
    } catch (error) {
      return ctx.badRequest('Failed to update post', { error: error.message });
    }
  },

  async delete(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      const { id } = ctx.params;
      const post = await strapi.entityService.findOne('api::post.post', id);

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Check if user is the author
      if (post.author?.id !== user.id) {
        return ctx.forbidden('You can only delete your own posts');
      }

      await strapi.entityService.delete('api::post.post', id);

      return ctx.send({ success: true });
    } catch (error) {
      return ctx.badRequest('Failed to delete post', { error: error.message });
    }
  }
}));