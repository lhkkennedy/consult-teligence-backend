/**
 * timeline-item controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::timeline-item.timeline-item', ({ strapi }) => ({
  async create(ctx) {
    try {
      // If request is from an admin API token, allow and use the provided author
      const isAdminToken = ctx.state?.auth?.strategy?.name === 'api-token';

      if (!isAdminToken) {
        // For normal users, require authentication and set author to user.id
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized('You must be logged in.');
        }
        
        // Ensure data object exists
        if (!ctx.request.body.data) {
          ctx.request.body.data = {};
        }
        
        ctx.request.body.data = {
          ...ctx.request.body.data,
          author: user.id,
        };
      }
      
      // For admin API token, allow author to be set in the payload
      // Call the parent create method
      const result = await strapi.entityService.create('api::timeline-item.timeline-item', {
        data: ctx.request.body.data,
        populate: ['author', 'property']
      });
      
      return result;
    } catch (error) {
      strapi.log.error('Error creating timeline item:', error);
      return ctx.internalServerError('Failed to create timeline item');
    }
  },
})); 