import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.role', ({ strapi }) => ({
  async find(ctx) {
    try {
      // Use a direct database query to avoid the attribute level operator issue
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
        populate: {
          permissions: {
            fields: ['id', 'action', 'subject']
          },
          users: {
            fields: ['id', 'username', 'email']
          }
        }
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

      // Use a direct database query with proper error handling
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { id: parseInt(id) || id },
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
  }
})); 