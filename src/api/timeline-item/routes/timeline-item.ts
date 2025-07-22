/**
 * timeline-item router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/timeline-items',
      handler: 'timeline-item.find',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/timeline-items/:id',
      handler: 'timeline-item.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/timeline-items',
      handler: 'timeline-item.create',
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
      path: '/timeline-items/:id',
      handler: 'timeline-item.update',
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
      path: '/timeline-items/:id',
      handler: 'timeline-item.delete',
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