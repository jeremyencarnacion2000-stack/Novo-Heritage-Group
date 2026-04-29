import postgres from 'postgres';

const DATABASE_URL = "postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

// sql function for Neon PostgreSQL queries
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 10, // Adjust based on your Neon tier
  idle_timeout: 20,
  connect_timeout: 30,
});

export default sql;
