export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cors: {
    enabled: true,
    origin: ['*'],
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
});
