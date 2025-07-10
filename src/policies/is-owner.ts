export default async (ctx, next) => {
  const { id } = ctx.params;
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized('You must be logged in.');
  }

  // Strapi v5: Use documentService to fetch the timeline item with its author
  const item = await strapi.service('api::timeline-item.timeline-item').findOne(id, {
    populate: ['author'],
  }) as any;

  if (!item || !item.author || item.author.id !== user.id) {
    return ctx.unauthorized('You are not the owner of this item.');
  }

  // Proceed if owner
  return await next();
}; 