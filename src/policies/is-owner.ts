interface Context {
  params: { id?: number };
  state: { user?: { id: number } };
  badRequest: (message: string) => any;
  unauthorized: (message: string) => any;
  notFound: (message: string) => any;
  internalServerError: (message: string) => any;
}

interface NextFunction {
  (): Promise<any>;
}

export default async (ctx: Context, next: NextFunction) => {
  try {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!id) {
      return ctx.badRequest('Item ID is required');
    }

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    // Strapi v5: Use documentService to fetch the timeline item with its author
    const item = await strapi.service('api::timeline-item.timeline-item').findOne(id, {
      populate: ['author'],
    }) as any;

    if (!item) {
      return ctx.notFound('Timeline item not found');
    }

    if (!item.author) {
      return ctx.unauthorized('Timeline item has no author');
    }

    if (item.author.id !== user.id) {
      return ctx.unauthorized('You are not the owner of this item.');
    }

    // Proceed if owner
    return await next();
  } catch (error) {
    strapi.log.error('Error in is-owner policy:', error);
    return ctx.internalServerError('Error checking ownership');
  }
}; 