export default async (ctx: any, next: any) => {
  if (!ctx.state.user) {
    return ctx.unauthorized('Authentication required');
  }
  
  await next();
};