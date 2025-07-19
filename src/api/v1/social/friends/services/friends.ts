'use strict';

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::friends.friend', ({ strapi }) => ({
  async getFriendsForUser(userId: any) {
    const friendships = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      } as any,
      populate: {
        user1: {
          populate: 'profileImage'
        },
        user2: {
          populate: 'profileImage'
        }
      } as any
    });

    // Transform friendships to return the other user (not the requesting user)
    return friendships.map((friendship: any) => {
      return friendship.user1.id === userId ? friendship.user2 : friendship.user1;
    });
  },

  async checkFriendshipStatus(userId1: any, userId2: any) {
    // Check if they are friends
    const friendship = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      } as any
    });

    if (friendship.length > 0) {
      return { status: 'friends' };
    }

    // Check if there's a pending friend request
    const request = await strapi.entityService.findMany('api::friend-request.friend-request', {
      filters: {
        $or: [
          { from: userId1, to: userId2, status: 'pending' },
          { from: userId2, to: userId1, status: 'pending' }
        ]
      } as any
    });

    if (request.length > 0) {
      const requestItem = request[0] as any;
      return {
        status: requestItem.from === userId1 ? 'request_sent' : 'request_received',
        requestId: requestItem.id
      };
    }

    return { status: 'not_friends' };
  },

  async removeFriendship(userId1: any, userId2: any) {
    const friendship = await strapi.entityService.findMany('api::friends.friend', {
      filters: {
        $or: [
          { user1: userId1, user2: userId2 },
          { user1: userId2, user2: userId1 }
        ]
      } as any
    });

    if (friendship.length === 0) {
      throw new Error('Friendship not found');
    }

    const friendshipItem = friendship[0];
    if (!friendshipItem) {
      throw new Error('Friendship not found');
    }

    return await strapi.entityService.delete('api::friends.friend', friendshipItem.id);
  }
}));