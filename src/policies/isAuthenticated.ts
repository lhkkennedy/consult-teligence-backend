export default (ctx: any, next: any) => {
  if (!ctx.state.user) {
    return ctx.unauthorized('Authentication required');
  }
  
  return next();
};