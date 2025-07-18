'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::friends.friends', ({ strapi }) => ({
  async getFriendsForUser(userId) {
    const friendships = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      },
      populate: {
        user1: {
          populate: ['profileImage']
        },
        user2: {
          populate: ['profileImage']
        }
      }
    });
    
    // Transform to return only friend data (not the current user)
    return friendships.map(friendship => {
      return friendship.user1.id === userId ? friendship.user2 : friendship.user1;
    });
  },
  
  async checkFriendshipStatus(userId1, userId2) {
    // Check if they are friends
    const friendship = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      }
    });
    
    if (friendship.length > 0) {
      return {
        status: 'friends',
        friendship: friendship[0]
      };
    }
    
    // Check if there's a pending friend request
    const friendRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: userId1, to: userId2, status: 'pending' },
          { from: userId2, to: userId1, status: 'pending' }
        ]
      }
    });
    
    if (friendRequest.length > 0) {
      const request = friendRequest[0];
      return {
        status: request.from === userId1 ? 'request_sent' : 'request_received',
        request: request
      };
    }
    
    return {
      status: 'not_friends',
      friendship: null,
      request: null
    };
  },
  
  async removeFriendship(userId1, userId2) {
    const friendship = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      }
    });
    
    if (friendship.length === 0) {
      throw new Error('Friendship not found');
    }
    
    return await strapi.entityService.delete('api::friends.friends', friendship[0].id);
  }
}));