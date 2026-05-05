import postgres from 'postgres';

/**
 * Railway Database Connector - Lazy Initialization
 * Used for high-volume property ingestion and queries.
 */

let sql: any;

const getSql = () => {
  if (!sql) {
    const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL;
    
    if (!RAILWAY_DATABASE_URL) {
      // Fallback for build time
      return async () => [];
    }

    sql = postgres(RAILWAY_DATABASE_URL, {
      ssl: 'require',
      max: 15, // Higher pool for properties
      idle_timeout: 20,
      connect_timeout: 30,
    });
  }
  return sql;
};

const db = async (strings: TemplateStringsArray, ...values: any[]) => {
  const instance = getSql();
  if (typeof instance === 'function' && instance.name !== 'sql') {
    return [];
  }
  return instance(strings, ...values);
};

export default db;
