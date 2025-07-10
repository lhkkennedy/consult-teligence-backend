/**
 * timeline-item controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::timeline-item.timeline-item', ({ strapi }) => ({
  async create(ctx) {
    // Always set the author to the authenticated user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }
    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
    };
    return await super.create(ctx);
  },
})); 