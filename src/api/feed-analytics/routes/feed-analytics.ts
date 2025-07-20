export default {
  routes: [
    {
      method: 'GET',
      path: '/feed-analytics',
      handler: 'feed-analytics-record.find',
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
      path: '/feed-analytics/:id',
      handler: 'feed-analytics-record.findOne',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/feed-analytics',
      handler: 'feed-analytics-record.create',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/feed-analytics/:id',
      handler: 'feed-analytics-record.update',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/feed-analytics/:id',
      handler: 'feed-analytics-record.delete',
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