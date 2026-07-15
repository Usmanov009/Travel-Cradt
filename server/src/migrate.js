require('dotenv').config();
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        local_id INTEGER,
        type VARCHAR(50) NOT NULL DEFAULT 'custom',
        category VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT,
        duration VARCHAR(100),
        price NUMERIC(10,2) DEFAULT 0,
        price_currency VARCHAR(10) DEFAULT 'USD',
        rating NUMERIC(3,1) DEFAULT 0,
        included TEXT[],
        country VARCHAR(100),
        hotel VARCHAR(255),
        flight_included BOOLEAN DEFAULT FALSE,
        vibe TEXT,
        video TEXT,
        interests TEXT[],
        partners TEXT[],
        translations JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        type VARCHAR(50),
        price NUMERIC(10,2),
        price_currency VARCHAR(10) DEFAULT 'USD',
        name VARCHAR(255),
        phone VARCHAR(50),
        guests INTEGER DEFAULT 1,
        days INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending',
        booked_at TIMESTAMPTZ DEFAULT NOW(),
        package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tables created successfully.');
  } finally {
    client.release();
  }
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
