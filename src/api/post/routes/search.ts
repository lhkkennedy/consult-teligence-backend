export default {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.search',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/discover',
      handler: 'search.discover',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    }
  ]
};