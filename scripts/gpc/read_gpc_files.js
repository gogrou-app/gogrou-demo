const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../..");

const files = [
  "db/init/001_gpc_schema.sql",
  "db/init/002_gpc_seed.sql",
];

function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function inspectFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const exists = fs.existsSync(absolutePath);

  if (!exists) {
    return {
      file: relativePath,
      exists,
      sizeBytes: 0,
      createTableCount: 0,
      createIndexCount: 0,
      insertIntoCount: 0,
      technicalParametersCount: 0,
      jsonbCount: 0,
      onConflictCount: 0,
    };
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  const stats = fs.statSync(absolutePath);

  return {
    file: relativePath,
    exists,
    sizeBytes: stats.size,
    createTableCount: countMatches(content, /\bCREATE\s+TABLE\b/gi),
    createIndexCount: countMatches(content, /\bCREATE\s+INDEX\b/gi),
    insertIntoCount: countMatches(content, /\bINSERT\s+INTO\b/gi),
    technicalParametersCount: countMatches(content, /\btechnical_parameters\b/gi),
    jsonbCount: countMatches(content, /\bjsonb\b/gi),
    onConflictCount: countMatches(content, /\bON\s+CONFLICT\b/gi),
  };
}

function printReport(results) {
  console.log("GPC SQL file check");
  console.log("==================");

  for (const result of results) {
    console.log(`\n${result.file}`);
    console.log(`  exists: ${result.exists ? "yes" : "no"}`);
    console.log(`  size: ${result.sizeBytes} bytes`);
    console.log(`  CREATE TABLE: ${result.createTableCount}`);
    console.log(`  CREATE INDEX: ${result.createIndexCount}`);
    console.log(`  INSERT INTO: ${result.insertIntoCount}`);
    console.log(`  technical_parameters: ${result.technicalParametersCount}`);
    console.log(`  jsonb: ${result.jsonbCount}`);
    console.log(`  ON CONFLICT: ${result.onConflictCount}`);
  }

  const total = results.reduce(
    (acc, result) => ({
      sizeBytes: acc.sizeBytes + result.sizeBytes,
      createTableCount: acc.createTableCount + result.createTableCount,
      createIndexCount: acc.createIndexCount + result.createIndexCount,
      insertIntoCount: acc.insertIntoCount + result.insertIntoCount,
      technicalParametersCount: acc.technicalParametersCount + result.technicalParametersCount,
      jsonbCount: acc.jsonbCount + result.jsonbCount,
      onConflictCount: acc.onConflictCount + result.onConflictCount,
    }),
    {
      sizeBytes: 0,
      createTableCount: 0,
      createIndexCount: 0,
      insertIntoCount: 0,
      technicalParametersCount: 0,
      jsonbCount: 0,
      onConflictCount: 0,
    }
  );

  console.log("\nTotal");
  console.log(`  size: ${total.sizeBytes} bytes`);
  console.log(`  CREATE TABLE: ${total.createTableCount}`);
  console.log(`  CREATE INDEX: ${total.createIndexCount}`);
  console.log(`  INSERT INTO: ${total.insertIntoCount}`);
  console.log(`  technical_parameters: ${total.technicalParametersCount}`);
  console.log(`  jsonb: ${total.jsonbCount}`);
  console.log(`  ON CONFLICT: ${total.onConflictCount}`);
}

const results = files.map(inspectFile);
printReport(results);

if (results.some((result) => !result.exists)) {
  process.exitCode = 1;
}
