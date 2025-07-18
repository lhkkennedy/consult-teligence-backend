'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::friends.friends', ({ strapi }) => ({
  async find(ctx) {
    const userId = ctx.state.user.id;
    
    // Get user's friends
    const friends = await strapi.entityService.findMany('api::friends.friends', {
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
    const friendUsers = friends.map(friendship => {
      return friendship.user1.id === userId ? friendship.user2 : friendship.user1;
    });
    
    return {
      data: friendUsers,
      meta: {
        pagination: {
          page: 1,
          pageSize: friendUsers.length,
          pageCount: 1,
          total: friendUsers.length
        }
      }
    };
  },
  
  async delete(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    // Find the friendship
    const friendship = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: userId, user2: id },
          { user1: id, user2: userId }
        ]
      }
    });
    
    if (friendship.length === 0) {
      return ctx.notFound('Friendship not found');
    }
    
    // Delete the friendship
    await strapi.entityService.delete('api::friends.friends', friendship[0].id);
    
    return { success: true };
  },
  
  async checkStatus(ctx) {
    const { userId } = ctx.params;
    const currentUserId = ctx.state.user.id;
    
    // Check if they are friends
    const friendship = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: currentUserId, user2: userId },
          { user1: userId, user2: currentUserId }
        ]
      }
    });
    
    if (friendship.length > 0) {
      return {
        status: 'friends',
        data: null
      };
    }
    
    // Check if there's a pending friend request
    const friendRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: currentUserId, to: userId, status: 'pending' },
          { from: userId, to: currentUserId, status: 'pending' }
        ]
      }
    });
    
    if (friendRequest.length > 0) {
      const request = friendRequest[0];
      return {
        status: request.from === currentUserId ? 'request_sent' : 'request_received',
        data: request
      };
    }
    
    return {
      status: 'not_friends',
      data: null
    };
  }
}));