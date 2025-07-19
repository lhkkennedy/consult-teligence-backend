/**
 * friend-request router
 */

module.exports = {
  routes: [
    // Custom routes (more specific paths first)
    {
      method: 'GET',
      path: '/friend-requests/pending',
      handler: 'friend-request.getPending'
    },
    {
      method: 'GET',
      path: '/friend-requests/sent',
      handler: 'friend-request.getSent'
    },
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/friend-requests',
      handler: 'friend-request.find'
    },
    {
      method: 'POST',
      path: '/friend-requests',
      handler: 'friend-request.create'
    },
    {
      method: 'GET',
      path: '/friend-requests/:id',
      handler: 'friend-request.findOne'
    },
    {
      method: 'PUT',
      path: '/friend-requests/:id',
      handler: 'friend-request.update'
    },
    {
      method: 'DELETE',
      path: '/friend-requests/:id',
      handler: 'friend-request.delete'
    }
  ]
}; 