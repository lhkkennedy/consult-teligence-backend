'use strict';

import { factories } from '@strapi/strapi';

interface Friendship {
  id: string;
  user1: any;
  user2: any;
}

interface FriendRequest {
  id: string;
  from: any;
  to: any;
  status: string;
}

export default factories.createCoreController('api::friends.friend', ({ strapi }: { strapi: any }) => ({
  async find(ctx: any) {
    const userId = ctx.state.user.id;
    
    try {
      // Get user's friends
      const friends = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        } as any,
        populate: {
          user1: true,
          user2: true
        } as any
      });
      
      // Transform to return only friend data (not the current user)
      const friendUsers = friends.map((friendship: any) => {
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
    } catch (error) {
      strapi.log.error('Error fetching friends:', error);
      return ctx.internalServerError('Failed to fetch friends');
    }
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    if (!id) {
      return ctx.badRequest('Friend ID is required');
    }
    
    try {
      // Find the friendship
      const friendship = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: userId, user2: id },
            { user1: id, user2: userId }
          ]
        } as any,
        populate: {
          user1: true,
          user2: true
        } as any
      });
      
      if (friendship.length === 0) {
        return ctx.notFound('Friendship not found');
      }
      
      // Return the friend data (not the current user)
      const friendshipItem = friendship[0];
      const friendUser = friendshipItem.user1.id === userId ? friendshipItem.user2 : friendshipItem.user1;
      
      return {
        data: friendUser
      };
    } catch (error) {
      strapi.log.error('Error fetching friend:', error);
      return ctx.internalServerError('Failed to fetch friend');
    }
  },

  async create(ctx: any) {
    const { user2Id } = ctx.request.body;
    const userId = ctx.state.user.id;
    
    if (!user2Id) {
      return ctx.badRequest('Friend ID is required');
    }
    
    if (userId === user2Id) {
      return ctx.badRequest('Cannot add yourself as a friend');
    }
    
    try {
      // Check if friendship already exists
      const existingFriendship = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: userId, user2: user2Id },
            { user1: user2Id, user2: userId }
          ]
        } as any
      });
      
      if (existingFriendship.length > 0) {
        return ctx.badRequest('Friendship already exists');
      }
      
      // Create the friendship
      const friendship = await strapi.entityService.create('api::friends.friend', {
        data: {
          user1: userId,
          user2: user2Id
        }
      });
      
      return {
        data: friendship
      };
    } catch (error) {
      strapi.log.error('Error creating friendship:', error);
      return ctx.internalServerError('Failed to create friendship');
    }
  },

  async update(ctx: any) {
    // Friendships are typically not updated, but we'll implement a basic version
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    if (!id) {
      return ctx.badRequest('Friend ID is required');
    }
    
    try {
      // Find the friendship
      const friendship = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: userId, user2: id },
            { user1: id, user2: userId }
          ]
        } as any
      });
      
      if (friendship.length === 0) {
        return ctx.notFound('Friendship not found');
      }
      
      // For now, just return the existing friendship
      // In a real implementation, you might want to add additional fields to track
      return {
        data: friendship[0]
      };
    } catch (error) {
      strapi.log.error('Error updating friendship:', error);
      return ctx.internalServerError('Failed to update friendship');
    }
  },
  
  async delete(ctx: any) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;
    
    if (!id) {
      return ctx.badRequest('Friend ID is required');
    }
    
    try {
      // Find the friendship
      const friendship = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: userId, user2: id },
            { user1: id, user2: userId }
          ]
        } as any
      });
      
      if (friendship.length === 0) {
        return ctx.notFound('Friendship not found');
      }
      
      // Delete the friendship
      const friendshipItem = friendship[0] as Friendship;
      await strapi.entityService.delete('api::friends.friend', friendshipItem.id);
      
      return { success: true };
    } catch (error) {
      strapi.log.error('Error deleting friendship:', error);
      return ctx.internalServerError('Failed to delete friendship');
    }
  },
  
  async checkStatus(ctx: any) {
    const { userId } = ctx.params;
    const currentUserId = ctx.state.user.id;
    
    if (!userId) {
      return ctx.badRequest('User ID is required');
    }
    
    if (currentUserId === userId) {
      return ctx.badRequest('Cannot check friendship status with yourself');
    }
    
    try {
      // Check if they are friends
      const friendship = await strapi.entityService.findMany('api::friends.friend', {
        filters: {
          $or: [
            { user1: currentUserId, user2: userId },
            { user1: userId, user2: currentUserId }
          ]
        } as any
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
        } as any
      });
      
      if (friendRequest.length > 0) {
        const request = friendRequest[0] as FriendRequest;
        return {
          status: request.from === currentUserId ? 'request_sent' : 'request_received',
          data: request
        };
      }
      
      return {
        status: 'not_friends',
        data: null
      };
    } catch (error) {
      strapi.log.error('Error checking friendship status:', error);
      return ctx.internalServerError('Failed to check friendship status');
    }
  }
}));