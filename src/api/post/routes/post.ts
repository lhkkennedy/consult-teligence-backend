export default {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'post.findOne',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
      config: {
        auth: false, // Temporarily public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/posts/sample',
      handler: 'post.createSamplePosts',
      config: {
        auth: false, // Public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/posts/attach-properties',
      handler: 'post.attachPropertiesToPosts',
      config: {
        auth: false, // Public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'post.update',
      config: {
        auth: false, // Temporarily public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'post.delete',
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