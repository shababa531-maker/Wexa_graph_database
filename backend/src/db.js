require("dotenv").config();

const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are missing.");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
  {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10000
  }
);

async function verifyDatabaseConnection() {
  const session = driver.session();

  try {
    await session.run("RETURN 1 AS connected");
    return true;
  } finally {
    await session.close();
  }
}

async function closeDatabase() {
  await driver.close();
}

module.exports = {
  driver,
  verifyDatabaseConnection,
  closeDatabase
};




