module.exports = {
  routes: [
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