import postgres from 'postgres';

/**
 * CockroachDB Connector — Unified Backend Database
 * 
 * Used for:
 *  - inventario_digital (n8n multimedia ingestor)
 *  - leads (lead capture & conversion)
 *  - perfil_usuario (AI concierge context & tracking)
 *  - Property listings & real-time RAG context
 * 
 * This is the primary database for Novo Heritage Group, ensuring
 * stability and zero-limit scalability on the free tier.
 */

let sql: any;

const getSql = () => {
  if (!sql) {
    const url = process.env.COCKROACH_DATABASE_URL;
    
    if (!url) {
      // Fallback for build time - return safe no-op
      return async () => [];
    }

    sql = postgres(url, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 30,
    });
  }
  return sql;
};

const cockroachDb = async (strings: TemplateStringsArray, ...values: any[]) => {
  const instance = getSql();
  if (typeof instance === 'function' && instance.name !== 'sql') {
    return [];
  }
  return instance(strings, ...values);
};

export default cockroachDb;
