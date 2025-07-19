// src/policies/isAuthenticated.ts

import type { Context } from 'koa';

export default function isAuthenticated(
  policyContext: Context,
  config: Record<string, any>,
  { strapi }: { strapi: any }
): boolean {
  // if user not in state, send 401
  if (!policyContext.state.user) {
    policyContext.unauthorized('Authentication required');
    return false;
  }

  // allow the request
  return true;
}