describe('Friend System Integration Tests', () => {
  let strapi: any;

  beforeAll(async () => {
    strapi = await createStrapiInstance();
  });

  afterAll(async () => {
    await strapi.destroy();
  });

  beforeEach(async () => {
    // Clear test data
    await strapi.entityService.deleteMany('api::friend-request.friend-request', {});
    await strapi.entityService.deleteMany('api::friends.friends', {});
    await strapi.entityService.deleteMany('plugin::users-permissions.user', {});
  });

  describe('Complete Friend Request Workflow', () => {
    it('should handle complete friend request lifecycle', async () => {
      // Create test users
      const user1 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const user2 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      // Step 1: User1 sends friend request to User2
      const friendRequestCtx = {
        request: {
          body: {
            data: {
              to: user2.id,
              status: 'pending'
            }
          }
        },
        state: {
          user: { id: user1.id }
        },
        badRequest: jest.fn(),
        entityService: strapi.entityService
      };

      const friendRequestController = strapi.controller('api::friend-request.friend-request');
      const friendRequest = await friendRequestController.create(friendRequestCtx);

      expect(friendRequest).toBeDefined();
      expect(friendRequest.from).toBe(user1.id);
      expect(friendRequest.to).toBe(user2.id);
      expect(friendRequest.status).toBe('pending');

      // Step 2: Check that User2 has pending request
      const pendingCtx = {
        state: {
          user: { id: user2.id }
        },
        entityService: strapi.entityService
      };

      const pendingRequests = await friendRequestController.getPending(pendingCtx);
      expect(pendingRequests.data.length).toBe(1);
      expect(pendingRequests.data[0].id).toBe(friendRequest.id);

      // Step 3: Check that User1 has sent request
      const sentCtx = {
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const sentRequests = await friendRequestController.getSent(sentCtx);
      expect(sentRequests.data.length).toBe(1);
      expect(sentRequests.data[0].id).toBe(friendRequest.id);

      // Step 4: User2 accepts the friend request
      const acceptCtx = {
        params: { id: friendRequest.id },
        request: {
          body: {
            data: {
              status: 'accepted'
            }
          }
        },
        state: {
          user: { id: user2.id }
        },
        notFound: jest.fn(),
        forbidden: jest.fn(),
        entityService: strapi.entityService
      };

      const acceptedRequest = await friendRequestController.update(acceptCtx);
      expect(acceptedRequest.status).toBe('accepted');

      // Step 5: Verify friendship was created
      const friendsController = strapi.controller('api::friends.friends');
      const friendsCtx = {
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const friends = await friendsController.find(friendsCtx);
      expect(friends.data.length).toBe(1);
      expect(friends.data[0].id).toBe(user2.id);

      // Step 6: Check friendship status
      const statusCtx = {
        params: { userId: user2.id },
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const status = await friendsController.checkStatus(statusCtx);
      expect(status.status).toBe('friends');

      // Step 7: Remove friendship
      const deleteCtx = {
        params: { id: user2.id },
        state: {
          user: { id: user1.id }
        },
        notFound: jest.fn(),
        entityService: strapi.entityService
      };

      const deleteResult = await friendsController.delete(deleteCtx);
      expect(deleteResult.success).toBe(true);

      // Step 8: Verify friendship was removed
      const remainingFriends = await friendsController.find(friendsCtx);
      expect(remainingFriends.data.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate friend requests', async () => {
      const user1 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const user2 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      // Create first request
      const ctx1 = {
        request: {
          body: {
            data: {
              to: user2.id,
              status: 'pending'
            }
          }
        },
        state: {
          user: { id: user1.id }
        },
        badRequest: jest.fn(),
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friend-request.friend-request');
      await controller.create(ctx1);

      // Try to create duplicate request
      const ctx2 = {
        request: {
          body: {
            data: {
              to: user2.id,
              status: 'pending'
            }
          }
        },
        state: {
          user: { id: user1.id }
        },
        badRequest: jest.fn(),
        entityService: strapi.entityService
      };

      await controller.create(ctx2);
      expect(ctx2.badRequest).toHaveBeenCalledWith('Friend request already exists');
    });

    it('should handle unauthorized request updates', async () => {
      const user1 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const user2 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const friendRequest = await strapi.entityService.create('api::friend-request.friend-request', {
        data: {
          from: user1.id,
          to: user2.id,
          status: 'pending'
        }
      });

      // User1 (sender) tries to update the request
      const ctx = {
        params: { id: friendRequest.id },
        request: {
          body: {
            data: {
              status: 'accepted'
            }
          }
        },
        state: {
          user: { id: user1.id }
        },
        notFound: jest.fn(),
        forbidden: jest.fn(),
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friend-request.friend-request');
      await controller.update(ctx);

      expect(ctx.forbidden).toHaveBeenCalledWith('Not authorized to update this request');
    });
  });

  describe('Friendship Status Checking', () => {
    it('should return correct status for different scenarios', async () => {
      const user1 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const user2 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const controller = strapi.controller('api::friends.friends');

      // Test not_friends status
      const notFriendsCtx = {
        params: { userId: user2.id },
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      let status = await controller.checkStatus(notFriendsCtx);
      expect(status.status).toBe('not_friends');

      // Create friend request and test request_sent status
      await strapi.entityService.create('api::friend-request.friend-request', {
        data: {
          from: user1.id,
          to: user2.id,
          status: 'pending'
        }
      });

      status = await controller.checkStatus(notFriendsCtx);
      expect(status.status).toBe('request_sent');

      // Test request_received status from user2's perspective
      const receivedCtx = {
        params: { userId: user1.id },
        state: {
          user: { id: user2.id }
        },
        entityService: strapi.entityService
      };

      status = await controller.checkStatus(receivedCtx);
      expect(status.status).toBe('request_received');

      // Accept request and test friends status
      const friendRequest = await strapi.entityService.findMany('api::friend-request.friend-request', {
        filters: {
          from: user1.id,
          to: user2.id
        }
      });

      await strapi.entityService.update('api::friend-request.friend-request', friendRequest[0].id, {
        data: { status: 'accepted' }
      });

      // Create friendship manually since we're not using the controller
      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user2.id
        }
      });

      status = await controller.checkStatus(notFriendsCtx);
      expect(status.status).toBe('friends');
    });
  });
});

import { createStrapiInstance } from './utils/test-utils';