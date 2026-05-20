const { Pool } = require("pg");

let pool;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL není nastavená. Nastav process.env.DATABASE_URL pro připojení k PostgreSQL."
    );
  }

  return databaseUrl;
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function healthCheck() {
  const result = await query("SELECT NOW()");
  return result.rows[0];
}

async function close() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  query,
  healthCheck,
  close,
};
