require('dotenv').config();
const { Pool } = require('pg');

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
});

module.exports = pool;
