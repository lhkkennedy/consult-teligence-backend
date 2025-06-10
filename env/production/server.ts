// path: ./config/env/production/server.js

export default ({ env }) => ({
  // Use Render's automatically provided external URL
  url: env('RENDER_EXTERNAL_URL'),
  // It's recommended to enable proxy since Render sits behind one
  proxy: true,
  app: {
    // Make sure your APP_KEYS are set in Render's environment variables
    keys: env.array('APP_KEYS'),
  },
});