/**
 * property router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/properties',
      handler: 'property.find',
      config: {
        auth: false, // Make public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/properties/:id',
      handler: 'property.findOne',
      config: {
        auth: false, // Make public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/properties',
      handler: 'property.create',
      config: {
        auth: false, // Make public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/properties/:id',
      handler: 'property.update',
      config: {
        auth: false, // Make public for testing
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/properties/:id',
      handler: 'property.delete',
      config: {
        auth: false, // Make public for testing
        policies: [],
        middlewares: []
      }
    }
  ]
}; 