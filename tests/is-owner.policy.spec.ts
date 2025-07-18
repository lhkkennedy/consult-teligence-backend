
import isOwner from '../src/policies/is-owner';

describe('is-owner policy', () => {
  let ctx: any;
  let next: jest.Mock;
  let strapi: any;

  beforeEach(() => {
    next = jest.fn();
    ctx = {
      params: { id: 1 },
      state: { user: { id: 42 } },
      unauthorized: jest.fn((msg) => ({ error: msg })),
    };
    strapi = {
      service: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    };
    global.strapi = strapi;
  });

  afterEach(() => {
    delete global.strapi;
  });

  it('should allow if user is the owner', async () => {
    strapi.service().findOne.mockResolvedValue({ author: { id: 42 } });
    await isOwner(ctx, next);
    expect(next).toHaveBeenCalled();
  });

  it('should deny if user is not the owner', async () => {
    strapi.service().findOne.mockResolvedValue({ author: { id: 99 } });
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('You are not the owner of this item.');
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny if item or author is missing', async () => {
    strapi.service().findOne.mockResolvedValue(null);
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('You are not the owner of this item.');
    expect(next).not.toHaveBeenCalled();
  });
});