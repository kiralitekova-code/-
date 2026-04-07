import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function getDB() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = postgres(dbUrl, {
      ssl: 'require',
      max: 20,
    });
  }
  return sql;
}

export async function initDB() {
  const db = getDB();
  try {
    // Test connection
    const result = await db`SELECT 1`;
    console.log('[v0] Database connected successfully');
    return true;
  } catch (error) {
    console.error('[v0] Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDB() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}
