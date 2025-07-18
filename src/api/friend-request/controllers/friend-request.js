'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::friend-request.friend-request', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    // Validate input
    if (!data || !data.to) {
      return ctx.badRequest('Recipient user ID is required');
    }
    
    // Prevent self-friend requests
    if (userId === data.to) {
      return ctx.badRequest('Cannot send friend request to yourself');
    }
    
    try {
      // Check if recipient user exists
      const recipientUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.to);
      if (!recipientUser) {
        return ctx.badRequest('Recipient user not found');
      }
      
      // Check if request already exists (both directions)
      const existingRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
        filters: {
          $or: [
            { from: userId, to: data.to },
            { from: data.to, to: userId }
          ]
        }
      });
      
      if (existingRequest.length > 0) {
        const request = existingRequest[0];
        if (request.status === 'pending') {
          return ctx.badRequest('Friend request already exists');
        } else if (request.status === 'accepted') {
          return ctx.badRequest('Users are already friends');
        } else if (request.status === 'rejected') {
          // Allow creating a new request if the previous one was rejected
          await strapi.entityService.delete('api::friend-request.friend-request', request.id);
        }
      }
      
      // Check if users are already friends
      const existingFriendship = await strapi.entityService.findMany('api::friends.friend', {
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
          from: userId,
          status: 'pending' // Ensure status is set to pending
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
    } catch (error) {
      strapi.log.error('Error creating friend request:', error);
      return ctx.internalServerError('Failed to create friend request');
    }
  },
  
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    if (!data || !data.status) {
      return ctx.badRequest('Status is required');
    }
    
    if (!['accepted', 'rejected'].includes(data.status)) {
      return ctx.badRequest('Status must be either "accepted" or "rejected"');
    }
    
    try {
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
      
      // Check if request is already processed
      if (friendRequest.status !== 'pending') {
        return ctx.badRequest('Friend request has already been processed');
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
        try {
          await strapi.entityService.create('api::friends.friend', {
            data: {
              user1: friendRequest.from.id,
              user2: friendRequest.to.id
            }
          });
        } catch (friendshipError) {
          strapi.log.error('Error creating friendship after accepting request:', friendshipError);
          // Don't fail the request update, but log the error
        }
      }
      
      return result;
    } catch (error) {
      strapi.log.error('Error updating friend request:', error);
      return ctx.internalServerError('Failed to update friend request');
    }
  },
  
  async getPending(ctx) {
    const userId = ctx.state.user.id;
    
    try {
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
    } catch (error) {
      strapi.log.error('Error fetching pending friend requests:', error);
      return ctx.internalServerError('Failed to fetch pending friend requests');
    }
  },
  
  async getSent(ctx) {
    const userId = ctx.state.user.id;
    
    try {
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
    } catch (error) {
      strapi.log.error('Error fetching sent friend requests:', error);
      return ctx.internalServerError('Failed to fetch sent friend requests');
    }
  }
}));