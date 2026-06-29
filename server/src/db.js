const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

// Remove sslmode from URL to avoid duplicate SSL config warning in pg v8.11+
// SSL is handled via the 'ssl' option below instead
let connectionString = process.env.DATABASE_URL;
if (connectionString) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    connectionString = url.toString();
  } catch (_) {}
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[pool] idle client error:', err.message);
});

module.exports = pool;
