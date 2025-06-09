export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // Whitelist your frontend URL(s) here:
      origin: [
        'https://consult-teligence-frontend.vercel.app/',
        'http://localhost:5173'        // if you also test locally
      ],
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'],
      headers: ['Content-Type','Authorization','Origin','Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
