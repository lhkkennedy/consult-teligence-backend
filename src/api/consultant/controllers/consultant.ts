/**
 * consultant controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::consultant.consultant', ({ strapi }) => ({
  async create(ctx) {
    const { email, password, ...profileData } = ctx.request.body.data;

    // 1. Create the user (or fetch if already exists)
    let user = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (!user) {
      user = await strapi.plugins['users-permissions'].services.user.add({
        email,
        password,
        // add other user fields as needed
      });
    }

    // 2. Create the consultant profile, linking to userId
    const consultant = await strapi.service('api::consultant.consultant').create({
      data: {
        ...profileData,
        userId: user.id,
      },
    });

    // 3. Return the consultant profile (and optionally user info)
    ctx.body = consultant;
  },
}));
