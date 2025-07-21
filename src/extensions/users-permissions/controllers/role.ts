import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.role', ({ strapi }) => ({
  async find(ctx) {
    try {
      // Use the custom service to handle the query safely
      const result = await strapi.service('plugin::users-permissions.role').find(ctx.query);
      
      // Transform the response to match the expected API format
      return {
        data: result.results,
        meta: {
          pagination: result.pagination
        }
      };
    } catch (error) {
      strapi.log.error('Error in roles controller find:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ctx.badRequest('Failed to fetch roles', { error: errorMessage });
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;

      // Use the custom service to handle the query safely
      const role = await strapi.service('plugin::users-permissions.role').findOne(id, ctx.query);

      if (!role) {
        return ctx.notFound('Role not found');
      }

      return {
        data: role
      };
    } catch (error) {
      strapi.log.error('Error in roles controller findOne:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ctx.badRequest('Failed to fetch role', { error: errorMessage });
    }
  },

  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      // Use the custom service to create the role
      const role = await strapi.service('plugin::users-permissions.role').create(data);

      return {
        data: role
      };
    } catch (error) {
      strapi.log.error('Error in roles controller create:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ctx.badRequest('Failed to create role', { error: errorMessage });
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Use the custom service to update the role
      const role = await strapi.service('plugin::users-permissions.role').update(id, data);

      if (!role) {
        return ctx.notFound('Role not found');
      }

      return {
        data: role
      };
    } catch (error) {
      strapi.log.error('Error in roles controller update:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ctx.badRequest('Failed to update role', { error: errorMessage });
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Use the custom service to delete the role
      const role = await strapi.service('plugin::users-permissions.role').delete(id);

      if (!role) {
        return ctx.notFound('Role not found');
      }

      return {
        data: role
      };
    } catch (error) {
      strapi.log.error('Error in roles controller delete:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ctx.badRequest('Failed to delete role', { error: errorMessage });
    }
  }
})); 