export default () => ({ env }: { env: any }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      // Add additional configuration to prevent query issues
      advanced: {
        allowlist: ['localhost', '127.0.0.1'],
        blocklist: [],
      },
      // Ensure proper database query handling
      database: {
        client: env('DATABASE_CLIENT', 'sqlite'),
      },
      // Add query configuration to prevent operator issues
      query: {
        defaultLimit: 25,
        maxLimit: 100,
      },
    },
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
  // Add error handling middleware
  'strapi-plugin-populate-deep': {
    config: {
      defaultDepth: 3,
    },
  },
});
