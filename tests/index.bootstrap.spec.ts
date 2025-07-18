
import app from '../src/index';

describe('index bootstrap', () => {
  it('should subscribe to user afterCreate lifecycle and create consultant', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    create.mockResolvedValue({ id: 1 });
    const log = { error: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create }),
      },
      log,
    };
    app.bootstrap({ strapi });
    expect(subscribe).toHaveBeenCalled();
    // Simulate afterCreate event
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 2, username: 'testuser' } };
    await afterCreate(event);
    expect(create).toHaveBeenCalledWith({ data: { user: 2, firstName: 'testuser' } });
  });

  it('should log error if consultant creation fails', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    create.mockRejectedValue(new Error('fail'));
    const log = { error: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create }),
      },
      log,
    };
    app.bootstrap({ strapi });
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 3, username: 'failuser' } };
    await afterCreate(event);
    expect(log.error).toHaveBeenCalledWith('Failed to create consultant for user', expect.any(Error));
  });
});