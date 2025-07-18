'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::friend-request.friend-request', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    // Prevent self-friend requests
    if (userId === data.to) {
      return ctx.badRequest('Cannot send friend request to yourself');
    }
    
    // Check if request already exists
    const existingRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: userId, to: data.to },
          { from: data.to, to: userId }
        ]
      }
    });
    
    if (existingRequest.length > 0) {
      return ctx.badRequest('Friend request already exists');
    }
    
    // Check if users are already friends
    const existingFriendship = await strapi.entityService.findMany('api::friends.friends', {
      filters: {
        $or: [
          { user1: userId, user2: data.to },
          { user1: data.to, user2: userId }
        ]
      }
    });
    
    if (existingFriendship.length > 0) {
      return ctx.badRequest('Users are already friends');
    }
    
    // Create friend request
    const result = await strapi.entityService.create('api::friend-request.friend-request', {
      data: {
        ...data,
        from: userId
      },
      populate: {
        from: {
          populate: ['profileImage']
        },
        to: {
          populate: ['profileImage']
        }
      }
    });
    
    return result;
  },
  
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    // Get the friend request
    const friendRequest = await strapi.entityService.findOne('api::friend-request.friend-request', id, {
      populate: ['from', 'to']
    });
    
    if (!friendRequest) {
      return ctx.notFound('Friend request not found');
    }
    
    // Only the recipient can accept/reject
    if (friendRequest.to.id !== userId) {
      return ctx.forbidden('Not authorized to update this request');
    }
    
    // Update the request
    const result = await strapi.entityService.update('api::friend-request.friend-request', id, {
      data,
      populate: {
        from: {
          populate: ['profileImage']
        },
        to: {
          populate: ['profileImage']
        }
      }
    });
    
    // If accepted, create friendship
    if (data.status === 'accepted') {
      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: friendRequest.from.id,
          user2: friendRequest.to.id
        }
      });
    }
    
    return result;
  },
  
  async getPending(ctx) {
    const userId = ctx.state.user.id;
    
    const pendingRequests = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        to: userId,
        status: 'pending'
      },
      populate: {
        from: {
          populate: ['profileImage']
        },
        to: {
          populate: ['profileImage']
        }
      }
    });
    
    return {
      data: pendingRequests,
      meta: {
        pagination: {
          page: 1,
          pageSize: pendingRequests.length,
          pageCount: 1,
          total: pendingRequests.length
        }
      }
    };
  },
  
  async getSent(ctx) {
    const userId = ctx.state.user.id;
    
    const sentRequests = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        from: userId,
        status: 'pending'
      },
      populate: {
        from: {
          populate: ['profileImage']
        },
        to: {
          populate: ['profileImage']
        }
      }
    });
    
    return {
      data: sentRequests,
      meta: {
        pagination: {
          page: 1,
          pageSize: sentRequests.length,
          pageCount: 1,
          total: sentRequests.length
        }
      }
    };
  }
}));