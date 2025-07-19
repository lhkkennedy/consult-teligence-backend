# ConsultTelligence Backend

A Strapi-based backend application for managing consultants, properties, and social networking features.

## 🏗️ Project Structure

```
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── business/           # Business-related APIs
│   │       │   ├── consultant/     # Consultant management
│   │       │   └── property/       # Property management
│   │       ├── content/            # Content-related APIs
│   │       │   ├── article/        # Article management
│   │       │   └── timeline-item/  # Timeline posts
│   │       └── social/             # Social features
│   │           ├── friends/        # Friends management
│   │           └── friend-request/ # Friend requests
│   ├── components/
│   │   └── business/
│   │       └── consultants/        # Consultant components
│   ├── extensions/
│   │   └── users-permissions/      # User permissions extensions
│   ├── policies/
│   │   ├── auth/                   # Authentication policies
│   │   │   └── isAuthenticated.ts
│   │   └── business/               # Business logic policies
│   │       └── is-owner.ts
│   └── index.ts                    # Application bootstrap
├── config/
│   ├── environments/               # Environment-specific configs
│   │   └── env/
│   ├── admin.ts                    # Admin panel configuration
│   ├── api.ts                      # API configuration
│   ├── database.ts                 # Database configuration
│   ├── middlewares.ts              # Middleware configuration
│   ├── plugins.ts                  # Plugin configuration
│   └── server.ts                   # Server configuration
├── database/
│   └── schema/
│       └── migrations/             # Database migrations
├── docs/                           # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── BUG_FIXES_SUMMARY.md
│   ├── FRIEND_SYSTEM_API.md
│   ├── FRIEND_SYSTEM_IMPLEMENTATION_GUIDE.md
│   └── FRIEND_SYSTEM_README.md
├── scripts/
│   ├── data-import/                # Data import utilities
│   │   ├── upload_experts.py       # Expert data upload script
│   │   ├── mockData/               # Mock data files
│   │   └── images/                 # Profile images
│   ├── migration/                  # Migration scripts
│   │   └── migrate-http.ts
│   └── testing/                    # Testing scripts
│       └── test-friend-system.ts
├── tests/                          # Test files
├── types/
│   └── api/
│       └── generated/              # Generated TypeScript types
├── public/                         # Public assets
│   └── uploads/                    # File uploads
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Friend System API](./docs/FRIEND_SYSTEM_API.md)
- [Friend System Implementation Guide](./docs/FRIEND_SYSTEM_IMPLEMENTATION_GUIDE.md)

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📦 Scripts

### Data Import
```bash
# Import expert data
python scripts/data-import/upload_experts.py
```

### Migration
```bash
# Run HTTP migration
npm run ts-node scripts/migration/migrate-http.ts
```

### Testing
```bash
# Test friend system
npm run ts-node scripts/testing/test-friend-system.ts
```

## 🔧 Configuration

The application uses a modular configuration structure:

- `config/admin.ts` - Admin panel settings
- `config/api.ts` - API settings
- `config/database.ts` - Database connection and settings
- `config/middlewares.ts` - Middleware configuration
- `config/plugins.ts` - Plugin settings
- `config/server.ts` - Server configuration

## 🏛️ Architecture

### API Versioning
The API is organized under `src/api/v1/` to support future versioning.

### Business Logic
- **Business APIs**: Consultant and property management
- **Content APIs**: Articles and timeline posts
- **Social APIs**: Friends and friend requests

### Policies
- **Authentication**: User authentication and authorization
- **Business**: Business logic policies (e.g., ownership verification)

### Components
Reusable content types organized by business domain.

## 🔒 Security

- Authentication policies protect all API endpoints
- Ownership policies ensure users can only modify their own content
- Input validation and sanitization on all endpoints

## 📝 Contributing

1. Follow the established file structure
2. Add tests for new features
3. Update documentation as needed
4. Use TypeScript for all new code

## 📄 License

This project is private and proprietary.
