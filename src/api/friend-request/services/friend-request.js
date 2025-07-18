'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::friend-request.friend-request', ({ strapi }) => ({
  async checkExistingRequest(fromUserId, toUserId) {
    const existingRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: fromUserId, to: toUserId },
          { from: toUserId, to: fromUserId }
        ]
      }
    });
    
    return existingRequest.length > 0;
  },
  
  async checkExistingFriendship(userId1, userId2) {
    const existingFriendship = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      }
    });
    
    return existingFriendship.length > 0;
  },
  
  async getPendingRequestsForUser(userId) {
    return await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        to: userId,
        status: 'pending'
      },
      populate: {
        from: {
          populate: ['profileImage']
        }
      }
    });
  },
  
  async getSentRequestsForUser(userId) {
    return await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        from: userId,
        status: 'pending'
      },
      populate: {
        to: {
          populate: ['profileImage']
        }
      }
    });
  }
}));