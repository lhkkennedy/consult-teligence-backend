
import isOwner from '../src/policies/business/is-owner';

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
      badRequest: jest.fn((msg) => ({ error: msg })),
      notFound: jest.fn((msg) => ({ error: msg })),
      internalServerError: jest.fn((msg) => ({ error: msg })),
    };
    strapi = {
      service: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
      log: {
        error: jest.fn(),
      },
    };
    (global as any).strapi = strapi;
  });

  afterEach(() => {
    delete (global as any).strapi;
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

  it('should deny if item is missing', async () => {
    strapi.service().findOne.mockResolvedValue(null);
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('Timeline item not found');
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny if item has no author', async () => {
    strapi.service().findOne.mockResolvedValue({ id: 1, author: null });
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('Timeline item has no author');
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny if user is not authenticated', async () => {
    ctx.state.user = null;
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('Authentication required');
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny if item ID is missing', async () => {
    ctx.params.id = undefined;
    const result = await isOwner(ctx, next);
    expect(result.error).toBe('Item ID is required');
    expect(next).not.toHaveBeenCalled();
  });
});