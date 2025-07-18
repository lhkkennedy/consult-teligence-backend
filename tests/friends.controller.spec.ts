describe('Friends Controller', () => {
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

  describe('find', () => {
    it('should return friends list for user', async () => {
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

      const user3 = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser3',
          email: 'test3@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      // Create friendships
      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user2.id
        }
      });

      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user3.id
        }
      });

      const ctx = {
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.find(ctx);

      expect(result.data.length).toBe(2);
      expect(result.data).toContainEqual(expect.objectContaining({ id: user2.id }));
      expect(result.data).toContainEqual(expect.objectContaining({ id: user3.id }));
    });

    it('should return empty list when user has no friends', async () => {
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123!',
          confirmed: true,
          blocked: false,
          role: 1
        }
      });

      const ctx = {
        state: {
          user: { id: user.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.find(ctx);

      expect(result.data.length).toBe(0);
    });
  });

  describe('delete', () => {
    it('should remove friendship successfully', async () => {
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

      const friendship = await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user2.id
        }
      });

      const ctx = {
        params: { id: user2.id },
        state: {
          user: { id: user1.id }
        },
        notFound: jest.fn(),
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.delete(ctx);

      expect(result.success).toBe(true);

      // Verify friendship was deleted
      const remainingFriendships = await strapi.entityService.findMany('api::friends.friends', {
        filters: {
          $or: [
            { user1: user1.id, user2: user2.id },
            { user1: user2.id, user2: user1.id }
          ]
        }
      });

      expect(remainingFriendships.length).toBe(0);
    });

    it('should return not found when friendship does not exist', async () => {
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

      const ctx = {
        params: { id: user2.id },
        state: {
          user: { id: user1.id }
        },
        notFound: jest.fn(),
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      await controller.delete(ctx);

      expect(ctx.notFound).toHaveBeenCalledWith('Friendship not found');
    });
  });

  describe('checkStatus', () => {
    it('should return friends status when users are friends', async () => {
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

      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user2.id
        }
      });

      const ctx = {
        params: { userId: user2.id },
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.checkStatus(ctx);

      expect(result.status).toBe('friends');
      expect(result.data).toBeNull();
    });

    it('should return request_sent status when user sent a request', async () => {
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

      const ctx = {
        params: { userId: user2.id },
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.checkStatus(ctx);

      expect(result.status).toBe('request_sent');
      expect(result.data).toEqual(friendRequest);
    });

    it('should return request_received status when user received a request', async () => {
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

      const ctx = {
        params: { userId: user1.id },
        state: {
          user: { id: user2.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.checkStatus(ctx);

      expect(result.status).toBe('request_received');
      expect(result.data).toEqual(friendRequest);
    });

    it('should return not_friends status when no relationship exists', async () => {
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

      const ctx = {
        params: { userId: user2.id },
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friends.friends');
      const result = await controller.checkStatus(ctx);

      expect(result.status).toBe('not_friends');
      expect(result.data).toBeNull();
    });
  });
});

import { createStrapiInstance } from './utils/test-utils';