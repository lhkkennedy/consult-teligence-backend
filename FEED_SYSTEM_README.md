# Strapi v5 Feed System API

A comprehensive, feature-rich feed system for professional real estate networking platforms, built with Strapi v5.

## 🚀 Features

### Core Feed Functionality
- **Multi-category feeds**: All, Following, Trending, Saved, Discover
- **Advanced filtering**: By post type, sentiment, date range, location, deal size
- **Smart sorting**: Recent, Popular, Trending, Engagement-based
- **Real-time search**: Across posts, users, properties, and deals
- **Personalized recommendations**: Based on user preferences and behavior

### Engagement System
- **Rich reactions**: Like, Love, Celebrate, Insightful, Helpful
- **Threaded comments**: With reply functionality and moderation
- **Bookmarking**: Save posts to collections with notes
- **Sharing**: Track shares across different platforms
- **View analytics**: Track view duration and completion rates

### User Preferences & Personalization
- **Customizable feed preferences**: Deal sizes, property types, locations
- **Notification settings**: Granular control over notifications
- **Privacy controls**: Profile visibility and activity settings
- **Algorithm preferences**: Adjust feed ranking weights

### Analytics & Insights
- **User engagement tracking**: Comprehensive activity metrics
- **Market insights**: Sentiment analysis and trend detection
- **Performance monitoring**: Feed load times and API response metrics
- **Content recommendations**: AI-powered suggestions

## 📋 Content Types

### Posts
Enhanced posts with comprehensive metadata:
- Post types: NewListing, ProgressUpdate, Closing, Insight, Property
- Sentiment analysis: Bull, Bear, Neutral
- Deal metadata: Size, location, property type, stage, ROI estimates
- Engagement tracking: Views, reactions, comments, shares, saves
- SEO optimization: Titles, descriptions, keywords

### Reactions
User reactions with weighted scoring:
- Reaction types: Like, Love, Celebrate, Insightful, Helpful
- Weight-based engagement scoring
- User and post relationships

### Comments
Threaded comments with moderation:
- Reply functionality
- Edit history tracking
- Moderation flags and notes
- Pinned comments support

### Saves
Bookmarking system with collections:
- Multiple collections (default, deals, insights, etc.)
- Notes and annotations
- User organization

### Shares
Cross-platform sharing tracking:
- Share types: Network, External, Email, Copy Link
- Platform tracking (LinkedIn, Twitter, etc.)
- Click and recipient analytics

### Views
Comprehensive view analytics:
- View duration tracking
- Completion rates (viewed > 50%)
- Source attribution (feed, search, profile)

### Tags
Content categorization:
- Trending tag detection
- Usage count tracking
- Color coding support

### User Preferences
Personalized settings:
- Feed preferences (deal sizes, locations, post types)
- Notification settings
- Privacy controls
- Algorithm weight adjustments

### Feed Analytics
User engagement metrics:
- Daily activity tracking
- Time spent analytics
- Content preference analysis
- Recommendation data

## 🔌 API Endpoints

### Feed Endpoints
```
GET    /api/feed                    # Main feed with filters
GET    /api/feed/personalized       # Personalized feed
GET    /api/feed/trending          # Trending content
GET    /api/feed/following         # Following feed
GET    /api/feed/saved             # Saved posts
GET    /api/feed/discover          # Discovery feed
POST   /api/feed/refresh           # Refresh feed cache
```

### Post Interaction Endpoints
```
POST   /api/posts/:id/reactions    # Add reaction
DELETE /api/posts/:id/reactions    # Remove reaction
GET    /api/posts/:id/reactions/user # Get user reaction
POST   /api/posts/:id/comments     # Add comment
POST   /api/posts/:id/saves        # Save post
DELETE /api/posts/:id/saves        # Unsave post
GET    /api/posts/:id/saves/check  # Check if saved
POST   /api/posts/:id/shares       # Share post
POST   /api/posts/:id/views        # Track view
GET    /api/posts/:id/engagement   # Get engagement data
```

### User Preferences Endpoints
```
GET    /api/users/preferences      # Get user preferences
PUT    /api/users/preferences      # Update preferences
PATCH  /api/users/preferences/notifications # Update notifications
PATCH  /api/users/preferences/privacy # Update privacy
PATCH  /api/users/preferences/algorithm # Update algorithm
POST   /api/users/preferences/reset # Reset to defaults
```

### Analytics Endpoints
```
GET    /api/analytics/feed         # User feed analytics
GET    /api/analytics/market       # Market insights
GET    /api/analytics/trending-topics # Trending topics
POST   /api/analytics/update-engagement-scores # Update scores
POST   /api/analytics/track-activity # Track user activity
```

### Search & Discovery Endpoints
```
GET    /api/search                 # Search across content types
GET    /api/discover               # Discovery recommendations
```

### Core CRUD Endpoints
All content types have standard CRUD operations:
```
GET    /api/{content-type}         # List items
GET    /api/{content-type}/:id     # Get single item
POST   /api/{content-type}         # Create item
PUT    /api/{content-type}/:id     # Update item
DELETE /api/{content-type}/:id     # Delete item
```

## 🏗️ Architecture

### Services
- **FeedService**: Core feed logic and personalization
- **EngagementService**: Reactions, comments, saves, shares, views
- **AnalyticsService**: User activity tracking and insights
- **RecommendationService**: Content and connection recommendations

### Controllers
- **FeedController**: Feed retrieval and interaction endpoints
- **AnalyticsController**: Analytics and insights endpoints
- **SearchController**: Search and discovery functionality
- **UserPreferencesController**: User settings management

### Database Schema
Optimized for performance with:
- Proper indexing on frequently queried fields
- Efficient relationships between content types
- JSON fields for flexible metadata storage
- UUID primary keys for scalability

## 🔐 Security & Permissions

### Authentication
- JWT-based authentication
- User session management
- Role-based access control

### Authorization
- Content ownership validation
- Permission-based operations
- Rate limiting on sensitive endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📊 Performance Optimizations

### Caching Strategy
- Redis-based caching for feed data
- Cache invalidation on content updates
- User-specific cache keys

### Database Optimization
- Composite indexes for common queries
- Efficient pagination
- Query optimization

### API Performance
- Response compression
- Efficient data serialization
- Background job processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Strapi v5
- Database (PostgreSQL recommended)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations: `npm run strapi develop`

### Environment Variables
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=feed_system
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### Usage Examples

#### Get Personalized Feed
```javascript
const response = await fetch('/api/feed/personalized', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Add Reaction
```javascript
const response = await fetch('/api/posts/123/reactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reaction_type: 'like'
  })
});
```

#### Update User Preferences
```javascript
const response = await fetch('/api/users/preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferred_deal_sizes: ['$1M-$5M', '$5M-$10M'],
    preferred_locations: ['New York', 'Los Angeles']
  })
});
```

## 🔧 Configuration

### Feed Algorithm
Adjust feed ranking weights in user preferences:
```javascript
{
  content_relevance_weight: 0.4,
  connection_weight: 0.3,
  engagement_weight: 0.2,
  recency_weight: 0.1,
  trending_weight: 0.1
}
```

### Rate Limiting
Configure rate limits in middleware:
```javascript
const rateLimits = {
  'GET /api/feed': { window: '1m', max: 60 },
  'POST /api/posts/:id/reactions': { window: '1m', max: 10 }
};
```

### Caching
Configure cache TTL:
```javascript
const cacheTTL = {
  feed: 300,        // 5 minutes
  trending: 600,    // 10 minutes
  analytics: 3600   // 1 hour
};
```

## 📈 Monitoring

### Key Metrics
- Feed load times
- API response times
- User engagement rates
- Content creation rates
- Error rates

### Health Checks
- Database connectivity
- Cache availability
- External service status
- Feed generation performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API specification

---

This feed system provides a solid foundation for building scalable, feature-rich social networking platforms in the real estate industry. The modular architecture allows for easy extension and customization based on specific business requirements.