'use strict';

import { factories } from '@strapi/strapi';

interface FriendRequest {
  id: string;
  from: any;
  to: any;
  status: 'pending' | 'accepted' | 'rejected';
}

interface User {
  id: string;
  profileImage?: any;
}

export default factories.createCoreController('api::friend-request.friend-request', ({ strapi }) => ({
  // Standard CRUD methods
  async find(ctx: any) {
    const userId = ctx.state.user.id;
    
    try {
      // Get all friend requests for the current user (both sent and received)
      const friendRequests = await strapi.entityService.findMany('api::friend-request.friend-request', {
        filters: {
          $or: [
            { from: userId },
            { to: userId }
          ]
        } as any,
        populate: {
          from: true,
          to: true
        } as any
      });
      
      return {
        data: friendRequests,
        meta: {
          pagination: {
            page: 1,
            pageSize: friendRequests.length,
            pageCount: 1,
            total: friendRequests.length
          }
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching friend requests:', error);
      return ctx.internalServerError('Failed to fetch friend requests');
    }
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    if (!id) {
      return ctx.badRequest('Friend request ID is required');
    }
    
    try {
      // Get the friend request
      const friendRequest = await strapi.entityService.findOne('api::friend-request.friend-request', id, {
        populate: {
          from: true,
          to: true
        } as any
      }) as unknown as FriendRequest;
      
      if (!friendRequest) {
        return ctx.notFound('Friend request not found');
      }
      
      // Check if the current user is involved in this request
      if (friendRequest.from?.id !== userId && friendRequest.to?.id !== userId) {
        return ctx.forbidden('Not authorized to view this friend request');
      }
      
      return {
        data: friendRequest
      };
    } catch (error) {
      strapi.log.error('Error fetching friend request:', error);
      return ctx.internalServerError('Failed to fetch friend request');
    }
  },

  async delete(ctx: any) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    if (!id) {
      return ctx.badRequest('Friend request ID is required');
    }
    
    try {
      // Get the friend request
      const friendRequest = await strapi.entityService.findOne('api::friend-request.friend-request', id, {
        populate: ['from', 'to']
      }) as unknown as FriendRequest;
      
      if (!friendRequest) {
        return ctx.notFound('Friend request not found');
      }
      
      // Only the sender can delete the request
      if (friendRequest.from?.id !== userId) {
        return ctx.forbidden('Not authorized to delete this friend request');
      }
      
      // Delete the friend request
      await strapi.entityService.delete('api::friend-request.friend-request', id);
      
      return { success: true };
    } catch (error) {
      strapi.log.error('Error deleting friend request:', error);
      return ctx.internalServerError('Failed to delete friend request');
    }
  },

  // Override the default create method
  async create(ctx: any) {
    const { data } = ctx.request.body;
    const userId = ctx.state.user?.id;
    
    // Check if user is authenticated
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }
    
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
        const request = existingRequest[0] as unknown as FriendRequest;
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
        }
      });
      
      return result;
    } catch (error) {
      strapi.log.error('Error creating friend request:', error);
      return ctx.internalServerError('Failed to create friend request');
    }
  },

  // Override the default update method
  async update(ctx: any) {
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
      }) as unknown as FriendRequest;
      
      if (!friendRequest) {
        return ctx.notFound('Friend request not found');
      }
      
      // Only the recipient can accept/reject
      if (friendRequest.to?.id !== userId) {
        return ctx.forbidden('Not authorized to update this request');
      }
      
      // Check if request is already processed
      if (friendRequest.status !== 'pending') {
        return ctx.badRequest('Friend request has already been processed');
      }
      
      // Update the request
      const result = await strapi.entityService.update('api::friend-request.friend-request', id, {
        data
      });
      
      // If accepted, create friendship
      if (data.status === 'accepted') {
        try {
          await strapi.entityService.create('api::friends.friend', {
            data: {
              user1: friendRequest.from?.id,
              user2: friendRequest.to?.id
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

  // Custom methods
  async getPending(ctx: any) {
    const userId = ctx.state.user.id;
    
    try {
      const pendingRequests = await strapi.entityService.findMany('api::friend-request.friend-request', {
        filters: {
          to: userId,
          status: 'pending'
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
  
  async getSent(ctx: any) {
    const userId = ctx.state.user.id;
    
    try {
      const sentRequests = await strapi.entityService.findMany('api::friend-request.friend-request', {
        filters: {
          from: userId,
          status: 'pending'
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