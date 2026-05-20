const { DatabaseError } = require("pg");
const fs = require("fs/promises");
const path = require("path");
const db = require("../../lib/gpc/db");

// TODO: migrations
// TODO: rollback
// TODO: tenant bootstrap
// TODO: Docker init
// TODO: CI/CD

const projectRoot = path.resolve(__dirname, "../..");

const sqlFiles = [
  {
    label: "schema",
    path: "db/init/001_gpc_schema.sql",
    successMessage: "schema loaded",
  },
  {
    label: "seed",
    path: "db/init/002_gpc_seed.sql",
    successMessage: "seed loaded",
  },
];

async function readSqlFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  return fs.readFile(absolutePath, "utf8");
}

async function executeSqlFile(file) {
  const sql = await readSqlFile(file.path);
  await db.query(sql);
  console.log(file.successMessage);
}

function formatBootstrapError(error) {
  if (error instanceof DatabaseError) {
    return `PostgreSQL chyba: ${error.message}`;
  }

  if (error && error.code === "ENOENT") {
    return `SQL soubor nebyl nalezen: ${error.path}`;
  }

  return error && error.message ? error.message : "Neznámá chyba při GPC bootstrapu.";
}

async function bootstrapGpc() {
  for (const file of sqlFiles) {
    await executeSqlFile(file);
  }

  console.log("bootstrap completed");
}

async function main() {
  try {
    await bootstrapGpc();
  } catch (error) {
    console.error(`GPC bootstrap failed: ${formatBootstrapError(error)}`);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  bootstrapGpc,
};
