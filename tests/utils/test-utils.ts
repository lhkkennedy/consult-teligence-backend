// Helper function to create Strapi instance for testing
export async function createStrapiInstance() {
  let userIdCounter = 1;
  let friendRequestIdCounter = 1;
  let friendsIdCounter = 1;
  
  const users: any[] = [];
  const friendRequests: any[] = [];
  const friendships: any[] = [];

  const strapi = {
    entityService: {
      create: jest.fn().mockImplementation((entity: any, { data }: any) => {
        if (entity === 'plugin::users-permissions.user') {
          const user = {
            id: userIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          users.push(user);
          return Promise.resolve(user);
        }
        
        if (entity === 'api::friend-request.friend-request') {
          const friendRequest = {
            id: friendRequestIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          friendRequests.push(friendRequest);
          return Promise.resolve(friendRequest);
        }
        
        if (entity === 'api::friends.friends') {
          const friendship = {
            id: friendsIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          friendships.push(friendship);
          return Promise.resolve(friendship);
        }
        
        return Promise.resolve({ id: 1, ...data });
      }),
      
      findMany: jest.fn().mockImplementation((entity: any, filters?: any) => {
        if (entity === 'plugin::users-permissions.user') {
          return Promise.resolve(users);
        }
        
        if (entity === 'api::friend-request.friend-request') {
          let filtered = friendRequests;
          if (filters?.filters) {
            if (filters.filters.from) {
              filtered = filtered.filter((req: any) => req.from === filters.filters.from);
            }
            if (filters.filters.to) {
              filtered = filtered.filter((req: any) => req.to === filters.filters.to);
            }
          }
          return Promise.resolve(filtered);
        }
        
        if (entity === 'api::friends.friends') {
          let filtered = friendships;
          if (filters?.filters) {
            if (filters.filters.user1) {
              filtered = filtered.filter((friendship: any) => 
                friendship.user1 === filters.filters.user1 || friendship.user2 === filters.filters.user1
              );
            }
          }
          return Promise.resolve(filtered);
        }
        
        return Promise.resolve([]);
      }),
      
      findOne: jest.fn().mockImplementation((entity: any, id: number) => {
        if (entity === 'plugin::users-permissions.user') {
          return Promise.resolve(users.find(u => u.id === id));
        }
        
        if (entity === 'api::friend-request.friend-request') {
          return Promise.resolve(friendRequests.find(r => r.id === id));
        }
        
        if (entity === 'api::friends.friends') {
          return Promise.resolve(friendships.find(f => f.id === id));
        }
        
        return Promise.resolve(null);
      }),
      
      update: jest.fn().mockImplementation((entity: any, id: number, { data }: any) => {
        if (entity === 'api::friend-request.friend-request') {
          const request = friendRequests.find(r => r.id === id);
          if (request) {
            Object.assign(request, data);
            return Promise.resolve(request);
          }
        }
        
        if (entity === 'api::friends.friends') {
          const friendship = friendships.find(f => f.id === id);
          if (friendship) {
            Object.assign(friendship, data);
            return Promise.resolve(friendship);
          }
        }
        
        return Promise.resolve({ id, ...data });
      }),
      
      delete: jest.fn().mockImplementation((entity: any, id: number) => {
        if (entity === 'api::friends.friends') {
          const index = friendships.findIndex(f => f.id === id);
          if (index > -1) {
            friendships.splice(index, 1);
            return Promise.resolve({ success: true });
          }
        }
        
        return Promise.resolve({ success: true });
      }),
      
      deleteMany: jest.fn().mockImplementation((entity: any) => {
        if (entity === 'plugin::users-permissions.user') {
          users.length = 0;
        } else if (entity === 'api::friend-request.friend-request') {
          friendRequests.length = 0;
        } else if (entity === 'api::friends.friends') {
          friendships.length = 0;
        }
        return Promise.resolve({ count: 0 });
      })
    },
    
    controller: jest.fn().mockImplementation((controllerName: string) => {
      // Mock controller methods
      return {
        create: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friend-request.friend-request') {
            const { from, to, status } = ctx.request.body.data;
            const userId = ctx.state.user.id;
            
            // Check for self-friend request
            if (userId === to) {
              ctx.badRequest('Cannot send friend request to yourself');
              return;
            }
            
            // Check for duplicate requests
            const existing = friendRequests.find(r => r.from === userId && r.to === to);
            if (existing) {
              ctx.badRequest('Friend request already exists');
              return;
            }
            
            // Check if users are already friends
            const existingFriendship = friendships.find(f => 
              (f.user1 === userId && f.user2 === to) || (f.user1 === to && f.user2 === userId)
            );
            if (existingFriendship) {
              ctx.badRequest('Users are already friends');
              return;
            }
            
            const friendRequest = await strapi.entityService.create('api::friend-request.friend-request' as any, {
              data: { from: userId, to, status }
            });
            
            return friendRequest;
          }
        }),
        
        update: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friend-request.friend-request') {
            const request = await strapi.entityService.findOne('api::friend-request.friend-request' as any, ctx.params.id);
            if (!request) {
              ctx.notFound();
              return;
            }
            
            if ((request as any).to !== ctx.state.user.id) {
              ctx.forbidden('Not authorized to update this request');
              return;
            }
            
            const updated = await strapi.entityService.update('api::friend-request.friend-request' as any, ctx.params.id, {
              data: ctx.request.body.data
            });
            
            // If request is accepted, create friendship
            if (ctx.request.body.data.status === 'accepted') {
              await strapi.entityService.create('api::friends.friends' as any, {
                data: {
                  user1: (request as any).from,
                  user2: (request as any).to
                }
              });
            }
            
            return updated;
          }
        }),
        
        find: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friends.friends') {
            const userId = ctx.state.user.id;
            const friendships = await strapi.entityService.findMany('api::friends.friends' as any, {
              filters: { user1: userId }
            });
            
            // Get friend details
            const friends = await Promise.all(
              friendships.map(async (friendship: any) => {
                const friendId = friendship.user1 === userId ? friendship.user2 : friendship.user1;
                return await strapi.entityService.findOne('plugin::users-permissions.user', friendId);
              })
            );
            
            return { data: friends };
          }
        }),
        
        delete: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friends.friends') {
            const userId = ctx.state.user.id;
            const friendId = ctx.params.id;
            
            const friendship = friendships.find(f => 
              (f.user1 === userId && f.user2 === friendId) || 
              (f.user1 === friendId && f.user2 === userId)
            );
            
            if (!friendship) {
              ctx.notFound('Friendship not found');
              return;
            }
            
            await strapi.entityService.delete('api::friends.friends' as any, friendship.id);
            return { success: true };
          }
        }),
        
        checkStatus: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friends.friends') {
            const userId = ctx.state.user.id;
            const targetUserId = ctx.params.userId;
            
            // Check if they're friends
            const friendship = friendships.find(f => 
              (f.user1 === userId && f.user2 === targetUserId) || 
              (f.user1 === targetUserId && f.user2 === userId)
            );
            
            if (friendship) {
              return { status: 'friends', data: null };
            }
            
            // Check for pending requests
            const sentRequest = friendRequests.find(r => r.from === userId && r.to === targetUserId && r.status === 'pending');
            if (sentRequest) {
              return { status: 'request_sent', data: sentRequest };
            }
            
            const receivedRequest = friendRequests.find(r => r.from === targetUserId && r.to === userId && r.status === 'pending');
            if (receivedRequest) {
              return { status: 'request_received', data: receivedRequest };
            }
            
            return { status: 'not_friends', data: null };
          }
        }),
        
        getPending: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friend-request.friend-request') {
            const userId = ctx.state.user.id;
            const pending = friendRequests.filter(r => r.to === userId && r.status === 'pending');
            return { data: pending };
          }
        }),
        
        getSent: jest.fn().mockImplementation(async (ctx: any) => {
          if (controllerName === 'api::friend-request.friend-request') {
            const userId = ctx.state.user.id;
            const sent = friendRequests.filter(r => r.from === userId);
            return { data: sent };
          }
        })
      };
    }),
    
    destroy: jest.fn().mockResolvedValue(undefined)
  };

  return strapi;
}