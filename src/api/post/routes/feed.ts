export default {
  routes: [
    // Feed retrieval endpoints
    {
      method: 'GET',
      path: '/feed',
      handler: 'feed.getFeed',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/feed/personalized',
      handler: 'feed.getPersonalizedFeed',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/feed/trending',
      handler: 'feed.getTrendingFeed',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/feed/following',
      handler: 'feed.getFollowingFeed',
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
      path: '/feed/saved',
      handler: 'feed.getSavedFeed',
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
      path: '/feed/discover',
      handler: 'feed.getDiscoverFeed',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/feed/refresh',
      handler: 'feed.refreshFeed',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },

    // Post interaction endpoints
    {
      method: 'POST',
      path: '/posts/:id/reactions',
      handler: 'feed.addReaction',
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
      path: '/posts/:id/reactions',
      handler: 'feed.removeReaction',
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
      path: '/posts/:id/reactions/user',
      handler: 'feed.getUserReaction',
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
      path: '/posts/:id/comments',
      handler: 'feed.addComment',
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
      path: '/posts/:id/saves',
      handler: 'feed.savePost',
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
      path: '/posts/:id/saves',
      handler: 'feed.unsavePost',
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
      path: '/posts/:id/saves/check',
      handler: 'feed.isPostSaved',
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
      path: '/posts/:id/shares',
      handler: 'feed.sharePost',
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
      path: '/posts/:id/views',
      handler: 'feed.trackView',
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
      path: '/posts/:id/engagement',
      handler: 'feed.getPostEngagement',
      config: {
        auth: false, // Make public for feed access
        policies: [],
        middlewares: []
      }
    }
  ]
};