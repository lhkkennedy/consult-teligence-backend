export default {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/friends',
      handler: 'friends.find'
    },
    {
      method: 'GET',
      path: '/friends/:id',
      handler: 'friends.findOne'
    },
    {
      method: 'POST',
      path: '/friends',
      handler: 'friends.create'
    },
    {
      method: 'PUT',
      path: '/friends/:id',
      handler: 'friends.update'
    },
    {
      method: 'DELETE',
      path: '/friends/:id',
      handler: 'friends.delete'
    },
    // Custom routes
    {
      method: 'GET',
      path: '/friends/status/:userId',
      handler: 'friends.checkStatus'
    }
  ]
};