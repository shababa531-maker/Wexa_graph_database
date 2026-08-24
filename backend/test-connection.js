require("dotenv").config();
const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  console.error("❌ CognoDB environment variables are missing.");
  process.exit(1);
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

async function testConnection() {
  const session = driver.session();

  try {
    console.log("🔄 Connecting to CognoDB...");

    const result = await session.run(
      "RETURN 'CognoDB connection successful!' AS message"
    );

    console.log("✅", result.records[0].get("message"));
  } catch (error) {
    console.error("❌ CognoDB connection failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

testConnection();