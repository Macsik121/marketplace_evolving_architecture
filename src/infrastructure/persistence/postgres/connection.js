'use strict';

const { Pool } = require('pg');

let pool = null;

function getConnection() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      database: process.env.PG_DATABASE || 'marketplace',
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || '',
    });
  }
  return pool;
}

async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getConnection, closeConnection };
