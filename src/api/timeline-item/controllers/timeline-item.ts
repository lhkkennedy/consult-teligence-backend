/**
 * timeline-item controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::timeline-item.timeline-item', ({ strapi }) => ({
  async create(ctx) {
    // If request is from an admin API token, allow and use the provided author
    const isAdminToken = ctx.state?.auth?.strategy === 'admin-api-token';

    if (!isAdminToken) {
      // For normal users, require authentication and set author to user.id
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }
      ctx.request.body.data = {
        ...ctx.request.body.data,
        author: user.id,
      };
    }
    // For admin API token, allow author to be set in the payload
    return await super.create(ctx);
  },
})); 