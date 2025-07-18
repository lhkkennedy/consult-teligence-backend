module.exports = {
  routes: [
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
    }
  ]
};