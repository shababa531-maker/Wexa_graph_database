require("dotenv").config();
const neo4j = require("neo4j-driver");
const fs = require("fs");
const path = require("path");

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

async function runSchema() {
  const session = driver.session();

  try {
    const schemaPath = path.join(__dirname, "schema.cypher");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const statements = schema
      .split(";")
      .map(statement => statement.trim())
      .filter(Boolean);

    console.log(`🔄 Running ${statements.length} schema statements...`);

    for (const statement of statements) {
      await session.run(statement);
    }

    console.log("✅ Graph schema created successfully.");
  } catch (error) {
    console.error("❌ Failed to create graph schema.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

runSchema();