'use strict';

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::friend-request.friend-request', ({ strapi }) => ({
  async checkExistingRequest(fromUserId: any, toUserId: any) {
    const existingRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: fromUserId, to: toUserId },
          { from: toUserId, to: fromUserId }
        ]
      } as any
    });
    
    return existingRequest.length > 0 ? existingRequest[0] : null;
  },

  async checkExistingFriendship(userId1: any, userId2: any) {
    const existingFriendship = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      } as any
    });
    
    return existingFriendship.length > 0 ? existingFriendship[0] : null;
  },

  async getPendingRequestsForUser(userId: any) {
    return await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        to: userId,
        status: 'pending'
      } as any
    });
  },

  async getSentRequestsForUser(userId: any) {
    return await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        from: userId,
        status: 'pending'
      } as any
    });
  }
}));