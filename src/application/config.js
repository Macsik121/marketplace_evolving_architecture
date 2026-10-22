'use strict';

module.exports = {
  // Server
  port: process.env.PORT || 8000,

  // Database
  database: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'marketplace',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
};
