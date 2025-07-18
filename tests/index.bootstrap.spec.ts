
import app from '../src/index';

describe('index bootstrap', () => {
  it('should subscribe to user afterCreate lifecycle and create consultant', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    const findOne = jest.fn() as any;
    create.mockResolvedValue({ id: 1 });
    findOne.mockResolvedValue(null); // No existing consultant
    const log = { error: jest.fn(), warn: jest.fn(), info: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create, findOne }),
      },
      log,
    };
    app.bootstrap({ strapi });
    expect(subscribe).toHaveBeenCalled();
    // Simulate afterCreate event
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 2, username: 'testuser' } };
    await afterCreate(event);
    expect(findOne).toHaveBeenCalledWith({ where: { user: 2 } });
    expect(create).toHaveBeenCalledWith({ 
      data: { 
        user: 2, 
        firstName: 'testuser',
        lastName: '',
        location: '',
        company: '',
        currentRole: '',
        availability: 'Available'
      } 
    });
  });

  it('should log error if consultant creation fails', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    const findOne = jest.fn() as any;
    create.mockRejectedValue(new Error('fail'));
    findOne.mockResolvedValue(null); // No existing consultant
    const log = { error: jest.fn(), warn: jest.fn(), info: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create, findOne }),
      },
      log,
    };
    app.bootstrap({ strapi });
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 3, username: 'failuser' } };
    await afterCreate(event);
    expect(log.error).toHaveBeenCalledWith('Failed to create consultant for user', {
      userId: 3,
      error: 'fail',
      stack: expect.any(String)
    });
  });

  it('should not create consultant if user is missing required fields', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    const findOne = jest.fn() as any;
    const log = { error: jest.fn(), warn: jest.fn(), info: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create, findOne }),
      },
      log,
    };
    app.bootstrap({ strapi });
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 4 } }; // Missing username
    await afterCreate(event);
    expect(log.warn).toHaveBeenCalledWith('User creation event missing required fields:', { id: 4 });
    expect(create).not.toHaveBeenCalled();
  });

  it('should not create consultant if one already exists', async () => {
    const subscribe = jest.fn();
    const create = jest.fn() as any;
    const findOne = jest.fn() as any;
    findOne.mockResolvedValue({ id: 1, user: 5 }); // Existing consultant
    const log = { error: jest.fn(), warn: jest.fn(), info: jest.fn() };
    const strapi = {
      db: {
        lifecycles: { subscribe },
        query: jest.fn().mockReturnValue({ create, findOne }),
      },
      log,
    };
    app.bootstrap({ strapi });
    const afterCreate = (subscribe.mock.calls[0][0] as any).afterCreate;
    const event = { result: { id: 5, username: 'existinguser' } };
    await afterCreate(event);
    expect(log.info).toHaveBeenCalledWith('Consultant already exists for user 5');
    expect(create).not.toHaveBeenCalled();
  });
});