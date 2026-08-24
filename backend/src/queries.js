const { driver } = require("./db");

// ======================================================
// GET ALL CANDIDATES
// ======================================================

async function getCandidates() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (c:Candidate)
      RETURN c
      ORDER BY c.name
    `);

    return result.records.map((record) => {
      const candidate = record.get("c").properties;

      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        experience_years: candidate.experience_years,
        location: candidate.location,
        profile_summary: candidate.profile_summary || ""
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET ALL SKILLS
// ======================================================

async function getSkills() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (s:Skill)
      RETURN s
      ORDER BY s.name
    `);

    return result.records.map((record) => {
      const skill = record.get("s").properties;

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET SKILLS BY NAME
// ======================================================

async function getSkillsByName(name) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Skill)
      WHERE toLower(s.name) = toLower($name)
      RETURN s
      `,
      {
        name: name.trim()
      }
    );

    return result.records.map((record) => {
      const skill = record.get("s").properties;

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET ALL COMPANIES
// ======================================================

async function getCompanies() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (c:Company)
      RETURN c
      ORDER BY c.name
    `);

    return result.records.map((record) => {
      const company = record.get("c").properties;

      return {
        id: company.id,
        name: company.name,
        industry: company.industry,
        location: company.location
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET ALL JOBS WITH COMPANY
// ======================================================

async function getJobs() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (j:Job)-[:OFFERED_BY]->(company:Company)
      RETURN j, company
      ORDER BY j.title
    `);

    return result.records.map((record) => {
      const job = record.get("j").properties;
      const company = record.get("company").properties;

      return {
        id: job.id,
        title: job.title,
        description: job.description || "",
        experience_required: job.experience_required,
        location: job.location,
        employment_type: job.employment_type,

        company: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          location: company.location
        }
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET CANDIDATE SKILLS
// ======================================================

async function getCandidateSkills(candidateId) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
            -[r:HAS_SKILL]->(s:Skill)

      RETURN s, r
      ORDER BY s.name
      `,
      {
        candidateId
      }
    );

    return result.records.map((record) => {
      const skill = record.get("s").properties;
      const relationship = record.get("r").properties;

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency:
          relationship.proficiency || "Intermediate",
        years: relationship.years || 0
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET JOB SKILLS
// ======================================================

async function getJobSkills(jobId) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {id: $jobId})
            -[r:REQUIRES]->(s:Skill)

      RETURN s, r
      ORDER BY r.mandatory DESC, s.name
      `,
      {
        jobId
      }
    );

    return result.records.map((record) => {
      const skill = record.get("s").properties;
      const relationship = record.get("r").properties;

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        level: relationship.level || "Intermediate",
        mandatory:
          relationship.mandatory === undefined
            ? true
            : relationship.mandatory
      };
    });
  } finally {
    await session.close();
  }
}

// ======================================================
// GET CANDIDATE GRAPH
// Candidate → Skills → Jobs
// ======================================================

async function getCandidateGraph(candidateId) {
  const session = driver.session();

  try {
    // -----------------------------------------------
    // Candidate
    // -----------------------------------------------

    const candidateResult = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
      RETURN c
      `,
      {
        candidateId
      }
    );

    if (candidateResult.records.length === 0) {
      throw new Error("Candidate not found");
    }

    const candidate =
      candidateResult.records[0].get("c").properties;

    // -----------------------------------------------
    // Candidate Skills
    // -----------------------------------------------

    const skillResult = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
            -[r:HAS_SKILL]->(s:Skill)

      RETURN s, r
      ORDER BY s.name
      `,
      {
        candidateId
      }
    );

    const skills = skillResult.records.map((record) => {
      const skill = record.get("s").properties;
      const relationship = record.get("r").properties;

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency:
          relationship.proficiency || "Intermediate",
        years: relationship.years || 0
      };
    });

    // -----------------------------------------------
    // Matching Jobs
    // -----------------------------------------------

    const jobResult = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
            -[:HAS_SKILL]->(s:Skill)
            <-[:REQUIRES]-(j:Job)

      OPTIONAL MATCH (j)-[:OFFERED_BY]->(company:Company)

      WITH
        j,
        company,
        count(DISTINCT s) AS matchedSkills

      OPTIONAL MATCH (j)-[:REQUIRES]->(required:Skill)

      WITH
        j,
        company,
        matchedSkills,
        count(DISTINCT required) AS totalRequired

      RETURN
        j,
        company,
        matchedSkills,
        totalRequired

      ORDER BY j.title
      `,
      {
        candidateId
      }
    );

    const jobs = jobResult.records.map((record) => {
      const job = record.get("j").properties;

      const companyNode = record.get("company");

      const company = companyNode
        ? companyNode.properties
        : null;

      const matchedSkills =
        record.get("matchedSkills").toNumber();

      const totalRequired =
        record.get("totalRequired").toNumber();

      const matchPercentage =
        totalRequired > 0
          ? (matchedSkills / totalRequired) * 100
          : 0;

      return {
        id: job.id,
        title: job.title,
        description: job.description || "",
        experience_required:
          job.experience_required,
        location: job.location,
        employment_type:
          job.employment_type,

        matched_skills: matchedSkills,
        total_required: totalRequired,
        match_percentage: Number(
          matchPercentage.toFixed(2)
        ),

        company: company
          ? {
              id: company.id,
              name: company.name,
              industry: company.industry,
              location: company.location
            }
          : null
      };
    });

    return {
      candidate,
      skills,
      jobs
    };
  } finally {
    await session.close();
  }
}

// ======================================================
// CANDIDATE → MATCHING JOBS
// ======================================================

async function getJobMatches(candidateId) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
            -[:HAS_SKILL]->(s:Skill)
            <-[:REQUIRES]-(j:Job)

      WITH
        j,
        count(DISTINCT s) AS matchedSkills

      MATCH (j)-[:REQUIRES]->(required:Skill)

      WITH
        j,
        matchedSkills,
        count(DISTINCT required) AS totalRequired

      RETURN
        j.id AS job_id,
        j.title AS job_title,
        j.location AS location,
        matchedSkills AS matched_skills,
        totalRequired AS total_required,
        CASE
          WHEN totalRequired = 0 THEN 0
          ELSE 100.0 * matchedSkills / totalRequired
        END AS match_percentage

      ORDER BY match_percentage DESC
      `,
      {
        candidateId
      }
    );

    return result.records.map((record) => ({
      job_id: record.get("job_id"),
      job_title: record.get("job_title"),
      location: record.get("location"),

      matched_skills:
        record.get("matched_skills").toNumber(),

      total_required:
        record.get("total_required").toNumber(),

      match_percentage: Number(
        record.get("match_percentage")
      )
    }));
  } finally {
    await session.close();
  }
}

// ======================================================
// JOB → MATCHING CANDIDATES
// ======================================================

async function getJobCandidates(jobId) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {id: $jobId})
            -[:REQUIRES]->(s:Skill)
            <-[:HAS_SKILL]-(c:Candidate)

      WITH
        c,
        j,
        count(DISTINCT s) AS matchedSkills

      MATCH (j)-[:REQUIRES]->(required:Skill)

      WITH
        c,
        j,
        matchedSkills,
        count(DISTINCT required) AS totalRequired

      RETURN
        c.id AS candidate_id,
        c.name AS candidate_name,
        c.email AS email,
        c.location AS location,
        c.experience_years AS experience_years,
        matchedSkills AS matched_skills,
        totalRequired AS total_required,

        CASE
          WHEN totalRequired = 0 THEN 0
          ELSE 100.0 * matchedSkills / totalRequired
        END AS match_percentage

      ORDER BY match_percentage DESC
      `,
      {
        jobId
      }
    );

    return result.records.map((record) => ({
      candidate_id:
        record.get("candidate_id"),

      candidate_name:
        record.get("candidate_name"),

      email:
        record.get("email"),

      location:
        record.get("location"),

      experience_years:
        record.get("experience_years"),

      matched_skills:
        record.get("matched_skills").toNumber(),

      total_required:
        record.get("total_required").toNumber(),

      match_percentage: Number(
        record.get("match_percentage")
      )
    }));
  } finally {
    await session.close();
  }
}

// ======================================================
// CREATE CANDIDATE
// ======================================================

async function createCandidate(candidate) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      CREATE (c:Candidate {
        id: $id,
        name: $name,
        email: $email,
        experience_years: $experience_years,
        location: $location,
        profile_summary: $profile_summary
      })
      RETURN c
      `,
      {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        experience_years:
          Number(candidate.experience_years),
        location: candidate.location,
        profile_summary:
          candidate.profile_summary || ""
      }
    );

    return result.records[0]
      .get("c")
      .properties;
  } finally {
    await session.close();
  }
}

// ======================================================
// DELETE CANDIDATE
// ======================================================

async function deleteCandidate(candidateId) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
      WITH c
      DETACH DELETE c
      RETURN count(*) AS deleted
      `,
      {
        candidateId,
      }
    );

    const deleted = result.records[0]
      .get("deleted")
      .toNumber();

    if (deleted === 0) {
      throw new Error("Candidate not found");
    }

    return {
      id: candidateId,
      deleted: true,
    };
  } finally {
    await session.close();
  }
}
   

// ======================================================
// CREATE SKILL
// ======================================================

async function createSkill(skill) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      CREATE (s:Skill {
        id: $id,
        name: $name,
        category: $category
      })
      RETURN s
      `,
      {
        id: skill.id,
        name: skill.name,
        category: skill.category
      }
    );

    return result.records[0]
      .get("s")
      .properties;
  } finally {
    await session.close();
  }
}

// ======================================================
// CREATE COMPANY
// ======================================================

async function createCompany(company) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      CREATE (c:Company {
        id: $id,
        name: $name,
        industry: $industry,
        location: $location
      })
      RETURN c
      `,
      {
        id: company.id,
        name: company.name,
        industry: company.industry,
        location: company.location
      }
    );

    return result.records[0]
      .get("c")
      .properties;
  } finally {
    await session.close();
  }
}

// ======================================================
// CREATE JOB
// ======================================================

async function createJob(job) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      CREATE (j:Job {
        id: $id,
        title: $title,
        description: $description,
        experience_required: $experience_required,
        location: $location,
        employment_type: $employment_type
      })
      RETURN j
      `,
      {
        id: job.id,
        title: job.title,
        description: job.description || "",
        experience_required:
          Number(job.experience_required),
        location: job.location,
        employment_type:
          job.employment_type || "Full-time"
      }
    );

    return result.records[0]
      .get("j")
      .properties;
  } finally {
    await session.close();
  }
}

// ======================================================
// ADD CANDIDATE → SKILL
// ======================================================

async function addCandidateSkill(
  candidateId,
  skillId,
  proficiency,
  years
) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Candidate {id: $candidateId})
      MATCH (s:Skill {id: $skillId})

      CREATE (c)-[r:HAS_SKILL {
        proficiency: $proficiency,
        years: $years
      }]->(s)

      RETURN c, s, r
      `,
      {
        candidateId,
        skillId,
        proficiency:
          proficiency || "Intermediate",
        years: Number(years || 0)
      }
    );

    if (result.records.length === 0) {
      throw new Error(
        "Candidate or Skill not found"
      );
    }

    return {
      candidate:
        result.records[0]
          .get("c")
          .properties,

      skill:
        result.records[0]
          .get("s")
          .properties,

      relationship:
        result.records[0]
          .get("r")
          .properties
    };
  } finally {
    await session.close();
  }
}

// ======================================================
// ADD JOB → SKILL
// ======================================================

async function addJobSkill(
  jobId,
  skillId,
  level,
  mandatory
) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {id: $jobId})
      MATCH (s:Skill {id: $skillId})

      CREATE (j)-[r:REQUIRES {
        level: $level,
        mandatory: $mandatory
      }]->(s)

      RETURN j, s, r
      `,
      {
        jobId,
        skillId,
        level: level || "Intermediate",
        mandatory:
          mandatory === undefined
            ? true
            : Boolean(mandatory)
      }
    );

    if (result.records.length === 0) {
      throw new Error(
        "Job or Skill not found"
      );
    }

    return {
      job:
        result.records[0]
          .get("j")
          .properties,

      skill:
        result.records[0]
          .get("s")
          .properties,

      relationship:
        result.records[0]
          .get("r")
          .properties
    };
  } finally {
    await session.close();
  }
}

// ======================================================
// ADD JOB → COMPANY
// ======================================================

async function addJobCompany(
  jobId,
  companyId
) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {id: $jobId})
      MATCH (c:Company {id: $companyId})

      CREATE (j)-[:OFFERED_BY]->(c)

      RETURN j, c
      `,
      {
        jobId,
        companyId
      }
    );

    if (result.records.length === 0) {
      throw new Error(
        "Job or Company not found"
      );
    }

    return {
      job:
        result.records[0]
          .get("j")
          .properties,

      company:
        result.records[0]
          .get("c")
          .properties
    };
  } finally {
    await session.close();
  }
}

// ======================================================
// EXPORT EVERYTHING
// ======================================================

module.exports = {
  // GET
  getCandidates,
  getSkills,
  getSkillsByName,
  getCompanies,
  getJobs,
  getCandidateSkills,
  getJobSkills,
  getCandidateGraph,
  getJobMatches,
  getJobCandidates,

  // CREATE
  createCandidate,
  createSkill,
  createCompany,
  createJob,

  // DELETE
  deleteCandidate,

  // RELATIONSHIPS
  addCandidateSkill,
  addJobSkill,
  addJobCompany
};