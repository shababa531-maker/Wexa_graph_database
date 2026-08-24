require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  // ================================
  // GET
  // ================================
  getCandidates,
  getSkills,
  getCompanies,
  getJobs,
  getCandidateSkills,
  getJobSkills,
  getCandidateGraph,
  getJobMatches,
  getJobCandidates,
  getSkillsByName,

  // ================================
  // CREATE
  // ================================
  createCandidate,
  createSkill,
  createCompany,
  createJob,

  // ================================
  // RELATIONSHIPS
  // ================================
  addCandidateSkill,
  addJobSkill,
  addJobCompany,

  // ================================
  // DELETE
  // ================================
  deleteCandidate,
} = require("./src/queries");

const {
  verifyDatabaseConnection,
  closeDatabase,
} = require("./src/db");

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================================
// Middleware
// ======================================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

// ======================================================
// Basic API Information
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JobGraph API is running",
    version: "1.0.0",
    database: "CognoDB",
  });
});

// ======================================================
// Health Check
// ======================================================

app.get("/api/health", async (req, res) => {
  try {
    await verifyDatabaseConnection();

    res.json({
      success: true,
      message: "JobGraph API and CognoDB are connected",
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error.message
    );

    res.status(503).json({
      success: false,
      message: "Database is currently unavailable",
      error: error.message,
    });
  }
});

// ======================================================
// CANDIDATES
// ======================================================

// ------------------------------------------------------
// Get all candidates
// ------------------------------------------------------

app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await getCandidates();

    res.json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error(
      "Failed to fetch candidates:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch candidates",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Create Candidate + Skills
// IMPORTANT:
// This is the ONLY POST /api/candidates route.
// The duplicate route from your old code is removed.
// ------------------------------------------------------

app.post("/api/candidates", async (req, res) => {
  try {
    const {
      name,
      email,
      experience_years,
      location,
      profile_summary,
      skills = [],
    } = req.body;

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate email is required",
      });
    }

    if (experience_years === undefined || experience_years === null) {
      return res.status(400).json({
        success: false,
        message: "experience_years is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate location is required",
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "skills must be an array",
      });
    }

    // -----------------------------------------------
    // Validate experience
    // -----------------------------------------------

    const experience = Number(experience_years);

    if (Number.isNaN(experience) || experience < 0) {
      return res.status(400).json({
        success: false,
        message:
          "experience_years must be a valid positive number",
      });
    }

    // -----------------------------------------------
    // Create candidate ID
    // -----------------------------------------------

    const candidateId = `C${Date.now()}`;

    // -----------------------------------------------
    // Create candidate
    // -----------------------------------------------

    const candidate = await createCandidate({
      id: candidateId,
      name: name.trim(),
      email: email.trim(),
      experience_years: experience,
      location: location.trim(),
      profile_summary: profile_summary
        ? profile_summary.trim()
        : "",
    });

    // -----------------------------------------------
    // Connect candidate to skills
    // -----------------------------------------------

    const connectedSkills = [];

    for (const skill of skills) {
      if (!skill || !skill.name) {
        continue;
      }

      const skillName = skill.name.trim();

      if (!skillName) {
        continue;
      }

      let skillRecord;

      // -------------------------------------------
      // Find existing skill
      // -------------------------------------------

      const existingSkills = await getSkillsByName(
        skillName
      );

      if (existingSkills.length > 0) {
        skillRecord = existingSkills[0];
      } else {
        // -----------------------------------------
        // Create new skill
        // -----------------------------------------

        skillRecord = await createSkill({
          id: `S${Date.now()}${Math.floor(
            Math.random() * 10000
          )}`,
          name: skillName,
          category: skill.category || "General",
        });
      }

      // -------------------------------------------
      // Candidate → Skill relationship
      // -------------------------------------------

      const relationship = await addCandidateSkill(
        candidateId,
        skillRecord.id,
        skill.proficiency || "Intermediate",
        Number(skill.years || 0)
      );

      connectedSkills.push({
        skill: skillRecord,
        relationship,
      });
    }

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: {
        ...candidate,
        skills: connectedSkills,
      },
    });
  } catch (error) {
    console.error(
      "Failed to create candidate:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create candidate",
    });
  }
});

// ------------------------------------------------------
// Delete Candidate
// ------------------------------------------------------

app.delete("/api/candidates/:id", async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!candidateId || !candidateId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const deletedCandidate =
      await deleteCandidate(candidateId);

    res.json({
      success: true,
      message: "Candidate deleted successfully",
      data: deletedCandidate,
    });
  } catch (error) {
    console.error(
      "Failed to delete candidate:",
      error.message
    );

    if (
      error.message === "Candidate not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to delete candidate",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Get candidate skills
// ------------------------------------------------------

app.get(
  "/api/candidates/:id/skills",
  async (req, res) => {
    try {
      const skills = await getCandidateSkills(
        req.params.id
      );

      res.json({
        success: true,
        count: skills.length,
        data: skills,
      });
    } catch (error) {
      console.error(
        "Failed to fetch candidate skills:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch candidate skills",
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Get candidate graph
// ------------------------------------------------------

app.get(
  "/api/candidates/:id/graph",
  async (req, res) => {
    try {
      const graph = await getCandidateGraph(
        req.params.id
      );

      res.json({
        success: true,
        data: graph,
      });
    } catch (error) {
      console.error(
        "Failed to fetch candidate graph:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch candidate graph",
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Candidate → Matching Jobs
// ------------------------------------------------------

app.get(
  "/api/candidates/:id/matches",
  async (req, res) => {
    try {
      const matches = await getJobMatches(
        req.params.id
      );

      res.json({
        success: true,
        count: matches.length,
        data: matches,
      });
    } catch (error) {
      console.error(
        "Failed to calculate job matches:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to calculate job matches",
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Add skill to candidate
// ------------------------------------------------------

app.post(
  "/api/candidates/:id/skills",
  async (req, res) => {
    try {
      const {
        skill_id,
        proficiency,
        years,
      } = req.body;

      if (!skill_id) {
        return res.status(400).json({
          success: false,
          message: "skill_id is required",
        });
      }

      const relationship =
        await addCandidateSkill(
          req.params.id,
          skill_id,
          proficiency || "Intermediate",
          Number(years || 0)
        );

      res.status(201).json({
        success: true,
        message:
          "Candidate skill relationship created",
        data: relationship,
      });
    } catch (error) {
      console.error(
        "Failed to connect candidate skill:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ======================================================
// SKILLS
// ======================================================

// ------------------------------------------------------
// Get all skills
// ------------------------------------------------------

app.get("/api/skills", async (req, res) => {
  try {
    const skills = await getSkills();

    res.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error(
      "Failed to fetch skills:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch skills",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Create Skill
// ------------------------------------------------------

app.post("/api/skills", async (req, res) => {
  try {
    const {
      name,
      category,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill category is required",
      });
    }

    // -----------------------------------------------
    // Check duplicate skill
    // -----------------------------------------------

    const existingSkills =
      await getSkillsByName(name.trim());

    if (existingSkills.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Skill already exists",
        data: existingSkills[0],
      });
    }

    const skill = await createSkill({
      id: `S${Date.now()}${Math.floor(
        Math.random() * 10000
      )}`,
      name: name.trim(),
      category: category.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    console.error(
      "Failed to create skill:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to create skill",
      error: error.message,
    });
  }
});

// ======================================================
// COMPANIES
// ======================================================

// ------------------------------------------------------
// Get all companies
// ------------------------------------------------------

app.get("/api/companies", async (req, res) => {
  try {
    const companies = await getCompanies();

    res.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error(
      "Failed to fetch companies:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch companies",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Create Company
// ------------------------------------------------------

app.post("/api/companies", async (req, res) => {
  try {
    const {
      name,
      industry,
      location,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!industry || !industry.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company industry is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company location is required",
      });
    }

    const company = await createCompany({
      id: `CO${Date.now()}${Math.floor(
        Math.random() * 10000
      )}`,
      name: name.trim(),
      industry: industry.trim(),
      location: location.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error(
      "Failed to create company:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to create company",
      error: error.message,
    });
  }
});

// ======================================================
// JOBS
// ======================================================

// ------------------------------------------------------
// Get all jobs
// ------------------------------------------------------

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await getJobs();

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error(
      "Failed to fetch jobs:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch jobs",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Create Job
// ------------------------------------------------------

app.post("/api/jobs", async (req, res) => {
  try {
    const {
      title,
      description,
      experience_required,
      location,
      employment_type,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    if (
      experience_required === undefined ||
      experience_required === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "experience_required is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job location is required",
      });
    }

    const experience = Number(
      experience_required
    );

    if (
      Number.isNaN(experience) ||
      experience < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "experience_required must be a valid number",
      });
    }

    const job = await createJob({
      id: `J${Date.now()}${Math.floor(
        Math.random() * 10000
      )}`,
      title: title.trim(),
      description: description
        ? description.trim()
        : "",
      experience_required: experience,
      location: location.trim(),
      employment_type:
        employment_type || "Full-time",
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error(
      "Failed to create job:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to create job",
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// Get job skills
// ------------------------------------------------------

app.get(
  "/api/jobs/:id/skills",
  async (req, res) => {
    try {
      const skills = await getJobSkills(
        req.params.id
      );

      res.json({
        success: true,
        count: skills.length,
        data: skills,
      });
    } catch (error) {
      console.error(
        "Failed to fetch job skills:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to fetch job skills",
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Add Skill to Job
// ------------------------------------------------------

app.post(
  "/api/jobs/:id/skills",
  async (req, res) => {
    try {
      const {
        skill_id,
        level,
        mandatory,
      } = req.body;

      if (!skill_id) {
        return res.status(400).json({
          success: false,
          message: "skill_id is required",
        });
      }

      const relationship =
        await addJobSkill(
          req.params.id,
          skill_id,
          level || "Intermediate",
          mandatory === undefined
            ? true
            : Boolean(mandatory)
        );

      res.status(201).json({
        success: true,
        message:
          "Job skill relationship created",
        data: relationship,
      });
    } catch (error) {
      console.error(
        "Failed to connect job skill:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Connect Job → Company
// ------------------------------------------------------

app.post(
  "/api/jobs/:id/company",
  async (req, res) => {
    try {
      const {
        company_id,
      } = req.body;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          message: "company_id is required",
        });
      }

      const relationship =
        await addJobCompany(
          req.params.id,
          company_id
        );

      res.status(201).json({
        success: true,
        message:
          "Job company relationship created",
        data: relationship,
      });
    } catch (error) {
      console.error(
        "Failed to connect job company:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ------------------------------------------------------
// Job → Matching Candidates
// ------------------------------------------------------

app.get(
  "/api/jobs/:id/candidates",
  async (req, res) => {
    try {
      const candidates =
        await getJobCandidates(
          req.params.id
        );

      res.json({
        success: true,
        count: candidates.length,
        data: candidates,
      });
    } catch (error) {
      console.error(
        "Failed to fetch job candidates:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch job candidates",
        error: error.message,
      });
    }
  }
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(
  PORT,
  async () => {
    console.log(
      `🚀 JobGraph API running on http://localhost:${PORT}`
    );

    try {
      await verifyDatabaseConnection();

      console.log(
        "✅ CognoDB connection verified"
      );
    } catch (error) {
      console.error(
        "⚠️ CognoDB connection unavailable:",
        error.message
      );
    }
  }
);

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

async function shutdown() {
  console.log(
    "\n🛑 Shutting down JobGraph API..."
  );

  try {
    await closeDatabase();

    server.close(() => {
      console.log(
        "✅ Server stopped"
      );

      process.exit(0);
    });
  } catch (error) {
    console.error(
      "❌ Error during shutdown:",
      error.message
    );

    process.exit(1);
  }
}

process.on(
  "SIGINT",
  shutdown
);

process.on(
  "SIGTERM",
  shutdown
);