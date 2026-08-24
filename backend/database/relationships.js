require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

const candidateSkills = [
  ["C001", "S001", "Advanced", 3],
  ["C001", "S002", "Advanced", 3],
  ["C001", "S003", "Intermediate", 2],
  ["C001", "S006", "Intermediate", 2],
  ["C001", "S010", "Advanced", 3],

  ["C002", "S003", "Advanced", 5],
  ["C002", "S004", "Intermediate", 3],
  ["C002", "S006", "Advanced", 5],
  ["C002", "S008", "Intermediate", 2],
  ["C002", "S012", "Advanced", 4],

  ["C003", "S001", "Advanced", 2],
  ["C003", "S002", "Advanced", 2],
  ["C003", "S011", "Intermediate", 1],
  ["C003", "S010", "Advanced", 2],

  ["C004", "S005", "Advanced", 6],
  ["C004", "S006", "Advanced", 5],
  ["C004", "S008", "Advanced", 4],
  ["C004", "S009", "Advanced", 4],
  ["C004", "S010", "Advanced", 6],

  ["C005", "S001", "Advanced", 4],
  ["C005", "S003", "Advanced", 4],
  ["C005", "S006", "Advanced", 4],
  ["C005", "S007", "Intermediate", 3],
  ["C005", "S011", "Intermediate", 2],

  ["C006", "S001", "Intermediate", 1],
  ["C006", "S003", "Beginner", 1],
  ["C006", "S010", "Intermediate", 1],

  ["C007", "S002", "Expert", 7],
  ["C007", "S011", "Advanced", 5],
  ["C007", "S001", "Expert", 7],
  ["C007", "S010", "Advanced", 7],

  ["C008", "S003", "Advanced", 3],
  ["C008", "S008", "Intermediate", 2],
  ["C008", "S009", "Intermediate", 2],
  ["C008", "S012", "Advanced", 3],

  ["C009", "S004", "Advanced", 4],
  ["C009", "S006", "Advanced", 4],
  ["C009", "S007", "Advanced", 3],
  ["C009", "S010", "Advanced", 4],

  ["C010", "S001", "Advanced", 2],
  ["C010", "S002", "Intermediate", 2],
  ["C010", "S003", "Intermediate", 1],
  ["C010", "S012", "Intermediate", 2]
];

const candidateProjects = [
  ["C001", "P001", "Full Stack Developer", 8],
  ["C001", "P008", "Frontend Developer", 6],

  ["C002", "P002", "Backend Developer", 12],
  ["C002", "P006", "Backend Developer", 7],

  ["C003", "P003", "Frontend Developer", 8],
  ["C003", "P005", "Frontend Developer", 5],

  ["C004", "P004", "Cloud Engineer", 10],
  ["C004", "P007", "Software Architect", 12],

  ["C005", "P006", "Full Stack Developer", 9],
  ["C005", "P003", "Backend Developer", 6],

  ["C006", "P005", "Junior Developer", 4],

  ["C007", "P008", "Frontend Lead", 10],
  ["C007", "P001", "Frontend Architect", 9],

  ["C008", "P004", "Backend Developer", 8],
  ["C008", "P006", "Backend Developer", 6],

  ["C009", "P007", "Python Developer", 11],
  ["C009", "P003", "Backend Developer", 6],

  ["C010", "P001", "Frontend Developer", 6],
  ["C010", "P008", "Frontend Developer", 5]
];

const applications = [
  ["C001", "J001", "2026-08-10", "Applied"],
  ["C001", "J003", "2026-08-12", "Under Review"],

  ["C002", "J002", "2026-08-09", "Interview"],
  ["C002", "J006", "2026-08-11", "Applied"],

  ["C003", "J003", "2026-08-08", "Interview"],
  ["C003", "J001", "2026-08-13", "Applied"],

  ["C004", "J004", "2026-08-07", "Interview"],
  ["C004", "J006", "2026-08-12", "Applied"],

  ["C005", "J001", "2026-08-09", "Under Review"],
  ["C005", "J002", "2026-08-14", "Applied"],

  ["C006", "J002", "2026-08-15", "Applied"],

  ["C007", "J003", "2026-08-06", "Interview"],

  ["C008", "J004", "2026-08-11", "Applied"],
  ["C008", "J002", "2026-08-13", "Under Review"],

  ["C009", "J005", "2026-08-08", "Interview"],
  ["C009", "J006", "2026-08-14", "Applied"],

  ["C010", "J001", "2026-08-12", "Applied"],
  ["C010", "J003", "2026-08-14", "Under Review"]
];

const jobSkills = [
  ["J001", "S001", "Required", true],
  ["J001", "S002", "Required", true],
  ["J001", "S003", "Required", true],
  ["J001", "S006", "Preferred", false],

  ["J002", "S003", "Required", true],
  ["J002", "S006", "Required", true],
  ["J002", "S012", "Required", true],
  ["J002", "S008", "Preferred", false],

  ["J003", "S001", "Required", true],
  ["J003", "S002", "Required", true],
  ["J003", "S011", "Preferred", false],
  ["J003", "S010", "Preferred", false],

  ["J004", "S008", "Required", true],
  ["J004", "S009", "Required", true],
  ["J004", "S006", "Preferred", false],
  ["J004", "S010", "Required", true],

  ["J005", "S004", "Required", true],
  ["J005", "S006", "Required", true],
  ["J005", "S007", "Preferred", false],
  ["J005", "S010", "Preferred", false],

  ["J006", "S001", "Required", true],
  ["J006", "S003", "Preferred", false],
  ["J006", "S006", "Required", true],
  ["J006", "S010", "Required", true]
];

const jobCompanies = [
  ["J001", "CO001"],
  ["J002", "CO002"],
  ["J003", "CO003"],
  ["J004", "CO004"],
  ["J005", "CO003"],
  ["J006", "CO001"]
];

const projectTechnologies = [
  ["P001", "T001"],
  ["P001", "T002"],
  ["P001", "T004"],

  ["P002", "T003"],
  ["P002", "T004"],
  ["P002", "T009"],

  ["P003", "T001"],
  ["P003", "T007"],
  ["P003", "T004"],

  ["P004", "T002"],
  ["P004", "T005"],
  ["P004", "T006"],
  ["P004", "T010"],

  ["P005", "T001"],
  ["P005", "T003"],
  ["P005", "T004"],

  ["P006", "T002"],
  ["P006", "T004"],
  ["P006", "T005"],

  ["P007", "T003"],
  ["P007", "T004"],
  ["P007", "T009"],

  ["P008", "T001"],
  ["P008", "T002"],
  ["P008", "T007"]
];

const projectCompanies = [
  ["P001", "CO001"],
  ["P002", "CO002"],
  ["P003", "CO003"],
  ["P004", "CO004"],
  ["P005", "CO001"],
  ["P006", "CO002"],
  ["P007", "CO004"],
  ["P008", "CO001"]
];

async function createRelationships() {
  const session = driver.session();

  try {
    console.log("🔗 Creating graph relationships...");

    await session.run(
      `
      UNWIND $items AS item
      MATCH (c:Candidate {id: item[0]})
      MATCH (s:Skill {id: item[1]})
      MERGE (c)-[r:HAS_SKILL]->(s)
      SET r.proficiency = item[2],
          r.years = item[3]
      `,
      { items: candidateSkills }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (c:Candidate {id: item[0]})
      MATCH (p:Project {id: item[1]})
      MERGE (c)-[r:WORKED_ON]->(p)
      SET r.role = item[2],
          r.duration_months = item[3]
      `,
      { items: candidateProjects }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (c:Candidate {id: item[0]})
      MATCH (j:Job {id: item[1]})
      MERGE (c)-[r:APPLIED_FOR]->(j)
      SET r.applied_date = item[2],
          r.status = item[3]
      `,
      { items: applications }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (j:Job {id: item[0]})
      MATCH (s:Skill {id: item[1]})
      MERGE (j)-[r:REQUIRES]->(s)
      SET r.level = item[2],
          r.mandatory = item[3]
      `,
      { items: jobSkills }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (j:Job {id: item[0]})
      MATCH (c:Company {id: item[1]})
      MERGE (j)-[:OFFERED_BY]->(c)
      `,
      { items: jobCompanies }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (p:Project {id: item[0]})
      MATCH (t:Technology {id: item[1]})
      MERGE (p)-[:USES_TECHNOLOGY]->(t)
      `,
      { items: projectTechnologies }
    );

    await session.run(
      `
      UNWIND $items AS item
      MATCH (p:Project {id: item[0]})
      MATCH (c:Company {id: item[1]})
      MERGE (p)-[:BUILT_FOR]->(c)
      `,
      { items: projectCompanies }
    );

    console.log("✅ Relationships created successfully.");
  } catch (error) {
    console.error("❌ Relationship creation failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

createRelationships();