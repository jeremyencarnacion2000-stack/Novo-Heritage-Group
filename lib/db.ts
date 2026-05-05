import postgres from 'postgres'

// Lazy initialization to prevent build errors
let sql: any

const getSql = () => {
  if (!sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      // Return a no-op function when DATABASE_URL is missing (eg. during build)
      sql = async () => []
      return sql
    }
    sql = postgres(url, { ssl: 'require' })
  }
  return sql
}

// Export a generic query executor
const db = async (strings: TemplateStringsArray, ...values: any[]) => {
  const instance = getSql()
  // If it's the dummy function, just return empty
  if (typeof instance === 'function' && instance.name !== 'sql') {
    return []
  }
  return instance(strings, ...values)
}

export default db;
