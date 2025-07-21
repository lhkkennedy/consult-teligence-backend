import { factories } from '@strapi/strapi';

export default factories.createCoreService('plugin::users-permissions.role', ({ strapi }) => ({
  async find(params: any = {}) {
    try {
      // Use a more direct approach to avoid operator issues
      const { results, pagination } = await strapi.db.query('plugin::users-permissions.role').findPage({
        ...params,
        populate: {
          permissions: true,
          users: true
        }
      });

      return {
        results,
        pagination
      };
    } catch (error) {
      strapi.log.error('Error in role service find:', error);
      throw error;
    }
  },

  async findOne(id: any, params: any = {}) {
    try {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { id },
        ...params,
        populate: {
          permissions: true,
          users: true
        }
      });

      return role;
    } catch (error) {
      strapi.log.error('Error in role service findOne:', error);
      throw error;
    }
  },

  async create(data: any) {
    try {
      const role = await strapi.db.query('plugin::users-permissions.role').create({
        data
      });

      return role;
    } catch (error) {
      strapi.log.error('Error in role service create:', error);
      throw error;
    }
  },

  async update(id: any, data: any) {
    try {
      const role = await strapi.db.query('plugin::users-permissions.role').update({
        where: { id },
        data
      });

      return role;
    } catch (error) {
      strapi.log.error('Error in role service update:', error);
      throw error;
    }
  },

  async delete(id: any) {
    try {
      const role = await strapi.db.query('plugin::users-permissions.role').delete({
        where: { id }
      });

      return role;
    } catch (error) {
      strapi.log.error('Error in role service delete:', error);
      throw error;
    }
  }
}));