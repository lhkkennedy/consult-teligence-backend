export default {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/friends',
      handler: 'friends.find',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/friends/:id',
      handler: 'friends.findOne',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'POST',
      path: '/friends',
      handler: 'friends.create',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'PUT',
      path: '/friends/:id',
      handler: 'friends.update',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    {
      method: 'DELETE',
      path: '/friends/:id',
      handler: 'friends.delete',
      config: {
        policies: ['global::isAuthenticated']
      }
    },
    // Custom routes
    {
      method: 'GET',
      path: '/friends/status/:userId',
      handler: 'friends.checkStatus',
      config: {
        policies: ['global::isAuthenticated']
      }
    }
  ]
};