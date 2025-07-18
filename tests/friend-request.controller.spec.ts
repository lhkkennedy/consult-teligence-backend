describe('Friend Request Controller', () => {
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

  describe('create', () => {
    it('should create a friend request successfully', async () => {
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

      const ctx = {
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
      const result = await controller.create(ctx);

      expect(result).toBeDefined();
      expect(result.from).toBe(user1.id);
      expect(result.to).toBe(user2.id);
      expect(result.status).toBe('pending');
    });

    it('should prevent self-friend requests', async () => {
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
        request: {
          body: {
            data: {
              to: user.id,
              status: 'pending'
            }
          }
        },
        state: {
          user: { id: user.id }
        },
        badRequest: jest.fn(),
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friend-request.friend-request');
      await controller.create(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith('Cannot send friend request to yourself');
    });

    it('should prevent duplicate friend requests', async () => {
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
      await strapi.entityService.create('api::friend-request.friend-request', {
        data: {
          from: user1.id,
          to: user2.id,
          status: 'pending'
        }
      });

      const ctx = {
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
      await controller.create(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith('Friend request already exists');
    });

    it('should prevent requests between existing friends', async () => {
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

      // Create friendship
      await strapi.entityService.create('api::friends.friends', {
        data: {
          user1: user1.id,
          user2: user2.id
        }
      });

      const ctx = {
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
      await controller.create(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith('Users are already friends');
    });
  });

  describe('update', () => {
    it('should accept friend request and create friendship', async () => {
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

      const controller = strapi.controller('api::friend-request.friend-request');
      const result = await controller.update(ctx);

      expect(result).toBeDefined();
      expect(result.status).toBe('accepted');

      // Check if friendship was created
      const friendships = await strapi.entityService.findMany('api::friends.friends', {
        filters: {
          $or: [
            { user1: user1.id, user2: user2.id },
            { user1: user2.id, user2: user1.id }
          ]
        }
      });

      expect(friendships.length).toBe(1);
    });

    it('should only allow recipient to update request', async () => {
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
        params: { id: friendRequest.id },
        request: {
          body: {
            data: {
              status: 'accepted'
            }
          }
        },
        state: {
          user: { id: user1.id } // Sender trying to update
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

  describe('getPending', () => {
    it('should return pending requests for user', async () => {
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

      await strapi.entityService.create('api::friend-request.friend-request', {
        data: {
          from: user1.id,
          to: user2.id,
          status: 'pending'
        }
      });

      const ctx = {
        state: {
          user: { id: user2.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friend-request.friend-request');
      const result = await controller.getPending(ctx);

      expect(result.data.length).toBe(1);
      expect(result.data[0].from).toBe(user1.id);
      expect(result.data[0].to).toBe(user2.id);
      expect(result.data[0].status).toBe('pending');
    });
  });

  describe('getSent', () => {
    it('should return sent requests for user', async () => {
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

      await strapi.entityService.create('api::friend-request.friend-request', {
        data: {
          from: user1.id,
          to: user2.id,
          status: 'pending'
        }
      });

      const ctx = {
        state: {
          user: { id: user1.id }
        },
        entityService: strapi.entityService
      };

      const controller = strapi.controller('api::friend-request.friend-request');
      const result = await controller.getSent(ctx);

      expect(result.data.length).toBe(1);
      expect(result.data[0].from).toBe(user1.id);
      expect(result.data[0].to).toBe(user2.id);
      expect(result.data[0].status).toBe('pending');
    });
  });
});

import { createStrapiInstance } from './utils/test-utils';