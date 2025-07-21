import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.role', ({ strapi }) => ({
  async find(ctx) {
    try {
      // Use the Document Service API to fetch roles with proper population
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
        populate: {
          permissions: {
            fields: ['id', 'action', 'subject']
          },
          users: {
            fields: ['id', 'username', 'email']
          }
        },
        orderBy: { name: 'asc' }
      });

      // Transform the data to match the expected API response format
      const transformedRoles = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        type: role.type,
        permissions: role.permissions || [],
        users: role.users || [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }));

      return {
        data: transformedRoles,
        meta: {
          pagination: {
            page: 1,
            pageSize: transformedRoles.length,
            pageCount: 1,
            total: transformedRoles.length
          }
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

      // Handle both numeric and string IDs properly
      const whereCondition = isNaN(Number(id)) ? { documentId: id } : { id: Number(id) };

      // Use the Document Service API with proper error handling
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: whereCondition,
        populate: {
          permissions: {
            fields: ['id', 'action', 'subject']
          },
          users: {
            fields: ['id', 'username', 'email']
          }
        }
      });

      if (!role) {
        return ctx.notFound('Role not found');
      }

      // Transform the data to match the expected API response format
      const transformedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        type: role.type,
        permissions: role.permissions || [],
        users: role.users || [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };

      return {
        data: transformedRole
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

      // Use the Document Service API to create the role
      const role = await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type || 'authenticated',
          permissions: data.permissions || []
        }
      });

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

      // Handle both numeric and string IDs properly
      const whereCondition = isNaN(Number(id)) ? { documentId: id } : { id: Number(id) };

      // Use the Document Service API to update the role
      const role = await strapi.db.query('plugin::users-permissions.role').update({
        where: whereCondition,
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          permissions: data.permissions || []
        }
      });

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

      // Handle both numeric and string IDs properly
      const whereCondition = isNaN(Number(id)) ? { documentId: id } : { id: Number(id) };

      // Use the Document Service API to delete the role
      const role = await strapi.db.query('plugin::users-permissions.role').delete({
        where: whereCondition
      });

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