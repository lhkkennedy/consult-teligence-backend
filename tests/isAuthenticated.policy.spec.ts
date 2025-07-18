import isAuthenticated from '../src/policies/isAuthenticated';
import { createStrapiInstance } from './utils/test-utils';

describe('IsAuthenticated Policy', () => {
  let strapi: any;

  beforeAll(async () => {
    strapi = await createStrapiInstance();
  });

  afterAll(async () => {
    await strapi.destroy();
  });

  describe('isAuthenticated', () => {
    it('should allow authenticated users to access friend system endpoints', async () => {
      const ctx = {
        state: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        }
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny unauthenticated users access to friend system endpoints', async () => {
      const ctx = {
        state: {},
        unauthorized: jest.fn()
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(ctx.unauthorized).toHaveBeenCalledWith('Authentication required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user state is null', async () => {
      const ctx = {
        state: {
          user: null
        },
        unauthorized: jest.fn()
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(ctx.unauthorized).toHaveBeenCalledWith('Authentication required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user state is undefined', async () => {
      const ctx = {
        state: {
          user: undefined
        },
        unauthorized: jest.fn()
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(ctx.unauthorized).toHaveBeenCalledWith('Authentication required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with friend request endpoints', async () => {
      const ctx = {
        state: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        },
        request: {
          method: 'POST',
          url: '/api/friend-requests'
        }
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('should work with friends endpoints', async () => {
      const ctx = {
        state: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        },
        request: {
          method: 'GET',
          url: '/api/friends'
        }
      };

      const next = jest.fn();

      await isAuthenticated(ctx, next);

      expect(next).toHaveBeenCalled();
    });
  });
});