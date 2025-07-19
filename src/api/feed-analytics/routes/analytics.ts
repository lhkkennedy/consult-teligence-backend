export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics/feed',
      handler: 'analytics.getFeedAnalytics',
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
      path: '/analytics/market',
      handler: 'analytics.getMarketInsights',
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
      path: '/analytics/trending-topics',
      handler: 'analytics.getTrendingTopics',
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
      path: '/analytics/update-engagement-scores',
      handler: 'analytics.updateEngagementScores',
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
      path: '/analytics/track-activity',
      handler: 'analytics.trackActivity',
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