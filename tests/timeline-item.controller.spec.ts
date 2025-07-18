import timelineItemController from '../src/api/timeline-item/controllers/timeline-item';

describe('timeline-item controller', () => {
  let ctx: any;
  let superCreate: jest.Mock;

  beforeEach(() => {
    superCreate = jest.fn();
    ctx = {
      state: {},
      request: { body: { data: {} } },
      unauthorized: jest.fn((msg) => ({ error: msg })),
    };
  });

  it('should allow admin token to set author', async () => {
    ctx.state.auth = { strategy: { name: 'api-token' } };
    await timelineItemController({ strapi: {} }).create.bind({ super: { create: superCreate } })(ctx);
    expect(superCreate).toHaveBeenCalledWith(ctx);
  });

  it('should require user authentication for normal users', async () => {
    ctx.state.user = { id: 123 };
    await timelineItemController({ strapi: {} }).create.bind({ super: { create: superCreate } })(ctx);
    expect(ctx.request.body.data.author).toBe(123);
    expect(superCreate).toHaveBeenCalledWith(ctx);
  });

  it('should return unauthorized if user is not logged in', async () => {
    const result = await timelineItemController({ strapi: {} }).create.bind({ super: { create: superCreate } })(ctx);
    expect(result.error).toBe('You must be logged in.');
    expect(superCreate).not.toHaveBeenCalled();
  });
});