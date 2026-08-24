const {
  getCandidates,
  getJobs,
  getCandidateSkills,
  getJobSkills,
  getJobMatches
} = require("./queries");

const { closeDatabase } = require("./db");

async function testQueries() {
  try {
    console.log("\n📌 CANDIDATES");

    const candidates = await getCandidates();
    console.table(candidates);

    console.log("\n📌 JOBS");

    const jobs = await getJobs();
    console.table(
      jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company.name,
        location: job.location
      }))
    );

    console.log("\n📌 CANDIDATE C001 SKILLS");

    const skills = await getCandidateSkills("C001");
    console.table(skills);

    console.log("\n📌 JOB J001 SKILLS");

    const jobSkills = await getJobSkills("J001");
    console.table(jobSkills);

    console.log("\n📌 JOB MATCHES FOR C001");

    const matches = await getJobMatches("C001");
    console.table(matches);
  } catch (error) {
    console.error("❌ Query test failed.");
    console.error(error.message);
  } finally {
    await closeDatabase();
  }
}

testQueries();