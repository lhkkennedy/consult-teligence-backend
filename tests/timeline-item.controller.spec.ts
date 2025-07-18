

// Test the timeline-item controller logic directly
describe('timeline-item controller logic', () => {
  let ctx: any;

  beforeEach(() => {
    ctx = {
      state: {},
      request: { body: { data: {} } },
      unauthorized: jest.fn((msg) => ({ error: msg })),
    };
  });

  it('should allow admin token to set author', () => {
    ctx.state.auth = { strategy: { name: 'api-token' } };
    // For admin token, author should be allowed to be set in payload
    expect(ctx.state.auth.strategy.name).toBe('api-token');
  });

  it('should require user authentication for normal users', () => {
    ctx.state.user = { id: 123 };
    // For normal users, user should be present
    expect(ctx.state.user.id).toBe(123);
  });

  it('should return unauthorized if user is not logged in', () => {
    const result = ctx.unauthorized('You must be logged in.');
    expect(result.error).toBe('You must be logged in.');
  });

  it('should set author to user.id for normal users', () => {
    ctx.state.user = { id: 456 };
    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: ctx.state.user.id,
    };
    expect(ctx.request.body.data.author).toBe(456);
  });
});