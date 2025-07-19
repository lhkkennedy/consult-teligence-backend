/**
 * friend-request router
 */

module.exports = {
  routes: [
    // Custom routes (more specific paths first)
    {
      method: 'GET',
      path: '/friend-requests/pending',
      handler: 'friend-request.getPending',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/friend-requests/sent',
      handler: 'friend-request.getSent',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/friend-requests',
      handler: 'friend-request.find',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'POST',
      path: '/friend-requests',
      handler: 'friend-request.create',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/friend-requests/:id',
      handler: 'friend-request.findOne',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'PUT',
      path: '/friend-requests/:id',
      handler: 'friend-request.update',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'DELETE',
      path: '/friend-requests/:id',
      handler: 'friend-request.delete',
      config: {
        policies: ['global::isAuthenticated']
      }
    }
  ]
}; 