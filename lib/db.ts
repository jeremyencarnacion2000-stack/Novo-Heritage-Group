import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set in environment variables.');
}

// sql function for Neon PostgreSQL queries
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 10, // Adjust based on your Neon tier
  idle_timeout: 20,
  connect_timeout: 30,
});

export default sql;
