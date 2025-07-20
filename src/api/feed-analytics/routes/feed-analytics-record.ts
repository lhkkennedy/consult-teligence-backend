export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics/feed',
      handler: 'feed-analytics-record.getFeedAnalytics',
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
      handler: 'feed-analytics-record.getMarketInsights',
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
      handler: 'feed-analytics-record.getTrendingTopics',
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
      handler: 'feed-analytics-record.updateEngagementScores',
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
      handler: 'feed-analytics-record.trackActivity',
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