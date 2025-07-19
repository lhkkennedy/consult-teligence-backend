# Project Documentation

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Timeline Item API](#timeline-item-api)
  - [Article API](#article-api)
  - [Consultant API](#consultant-api)
  - [Property API](#property-api)
- [Controllers & Custom Logic](#controllers--custom-logic)
- [Components](#components)
- [Bootstrap & Lifecycle](#bootstrap--lifecycle)
- [Examples](#examples)
- [Resources](#resources)

---

## Overview
This project is built with [Strapi](https://strapi.io/), a headless CMS. It provides APIs for managing timeline items, articles, consultants, and properties, with custom logic for user-consultant relationships. Components are provided as JSON data for use in the frontend.

---

## Getting Started

### Development
Start the application with auto-reload:
```bash
npm run develop
# or
yarn develop
```

### Production
Start the application in production mode:
```bash
npm run start
# or
yarn start
```

### Build Admin Panel
```bash
npm run build
# or
yarn build
```

---

## API Reference

### Authentication
- Most endpoints require authentication via JWT or API token.
- Some actions (like creating timeline items) have custom policies (see below).

### Timeline Item API
**Base URL:** `/api/timeline-items`

| Method | Endpoint           | Description                | Auth Required | Notes                       |
|--------|--------------------|----------------------------|---------------|-----------------------------|
| GET    | `/`                | List timeline items        | No            |                             |
| GET    | `/:id`             | Get a timeline item        | No            |                             |
| POST   | `/`                | Create a timeline item     | Yes           | Author auto-assigned        |
| PUT    | `/:id`             | Update a timeline item     | Yes           | Only owner can update       |
| DELETE | `/:id`             | Delete a timeline item     | Yes           | Only owner can delete       |

#### Example: Create Timeline Item
```bash
curl -X POST http://localhost:1337/api/timeline-items \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"data": {"title": "New Event", "description": "Details..."}}'
```
- If using an admin API token, you may set the `author` field directly.
- For normal users, the `author` is set to the authenticated user's ID.

### Article API
**Base URL:** `/api/articles`

| Method | Endpoint           | Description                | Auth Required |
|--------|--------------------|----------------------------|---------------|
| GET    | `/`                | List articles              | No            |
| GET    | `/:id`             | Get an article             | No            |
| POST   | `/`                | Create an article          | Yes           |
| PUT    | `/:id`             | Update an article          | Yes           |
| DELETE | `/:id`             | Delete an article          | Yes           |

#### Example: Get Articles
```bash
curl http://localhost:1337/api/articles
```

### Consultant API
**Base URL:** `/api/consultants`

| Method | Endpoint           | Description                | Auth Required |
|--------|--------------------|----------------------------|---------------|
| GET    | `/`                | List consultants           | No            |
| GET    | `/:id`             | Get a consultant           | No            |
| POST   | `/`                | Create a consultant        | Yes           |
| PUT    | `/:id`             | Update a consultant        | Yes           |
| DELETE | `/:id`             | Delete a consultant        | Yes           |

#### Example: List Consultants
```bash
curl http://localhost:1337/api/consultants
```

### Property API
**Base URL:** `/api/properties`

| Method | Endpoint           | Description                | Auth Required |
|--------|--------------------|----------------------------|---------------|
| GET    | `/`                | List properties            | No            |
| GET    | `/:id`             | Get a property             | No            |
| POST   | `/`                | Create a property          | Yes           |
| PUT    | `/:id`             | Update a property          | Yes           |
| DELETE | `/:id`             | Delete a property          | Yes           |

#### Example: Get Properties
```bash
curl http://localhost:1337/api/properties
```

---

## Controllers & Custom Logic

### Timeline Item Controller
- **Custom create logic:**
  - If the request is from an admin API token, the `author` can be set in the payload.
  - For normal users, the `author` is set to the authenticated user's ID. If not authenticated, returns 401 Unauthorized.
- **Update/Delete:**
  - Only the owner (author) can update or delete a timeline item (enforced by `global::is-owner` policy).

### Other Controllers
- Use Strapi's default CRUD logic for articles, consultants, and properties.
- (Commented code in consultant controller shows how to create a user and consultant profile together, but is not active.)

---

## Components

### Consultants Components
Located in `src/components/consultants/`:
- `case-studies.json`: List of case studies.
- `contact-info.json`: Consultant contact information.
- `testimonials.json`: Client testimonials.

#### Example: `case-studies.json`
```json
[
  {
    "title": "Project Alpha",
    "description": "Helped client achieve X..."
  },
  {
    "title": "Project Beta",
    "description": "Improved process Y..."
  }
]
```

#### Example: `contact-info.json`
```json
{
  "email": "consultant@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

#### Example: `testimonials.json`
```json
[
  {
    "client": "Acme Corp",
    "feedback": "Great experience!"
  }
]
```

---

## Bootstrap & Lifecycle

### `src/index.ts`
- **register**: Placeholder for code to run before app initialization.
- **bootstrap**: Subscribes to the user creation lifecycle. When a new user is created, a consultant profile is automatically created and linked to the user.

#### Example Logic
```js
strapi.db.lifecycles.subscribe({
  models: ["plugin::users-permissions.user"],
  async afterCreate(event) {
    const { result } = event;
    // Create consultant profile for new user
    await strapi.db.query("api::consultant.consultant").create({
      data: {
        user: result.id,
        firstName: result.username,
      },
    });
  },
});
```

---

## Examples

### Create a Timeline Item (User Auth)
```bash
curl -X POST http://localhost:1337/api/timeline-items \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"data": {"title": "Event Title", "description": "Event details."}}'
```

### Create a Timeline Item (Admin Token)
```bash
curl -X POST http://localhost:1337/api/timeline-items \
  -H "Authorization: Bearer <ADMIN_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"data": {"title": "Event Title", "description": "Event details.", "author": 1}}'
```

### Get All Articles
```bash
curl http://localhost:1337/api/articles
```

---

## Resources
- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Tutorials](https://strapi.io/tutorials)
- [Strapi Community](https://discord.strapi.io)
- [Awesome Strapi](https://github.com/strapi/awesome-strapi)