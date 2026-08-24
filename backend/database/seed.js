require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

const candidates = [
  {
    id: "C001",
    name: "Alia",
    email: "aliya@gmail.com",
    experience_years: 3,
    location: "Bangalore",
    profile_summary: "Full-stack developer specializing in modern web applications"
  },
  {
    id: "C002",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    experience_years: 5,
    location: "Hyderabad",
    profile_summary: "Backend engineer focused on scalable APIs"
  },
  {
    id: "C003",
    name: "Rani Patel",
    email: "rani@gmail.com",
    experience_years: 2,
    location: "Mumbai",
    profile_summary: "Frontend developer with strong UI engineering skills"
  },
  {
    id: "C004",
    name: "Rajesh Rathod",
    email: "Rajesh@gmail.com",
    experience_years: 6,
    location: "Pune",
    profile_summary: "Senior software engineer and cloud developer"
  },
  {
    id: "C005",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    experience_years: 4,
    location: "Chennai",
    profile_summary: "Full-stack engineer with database experience"
  },
  {
    id: "C006",
    name: "Arjun Kumar",
    email: "arjun@example.com",
    experience_years: 1,
    location: "Delhi",
    profile_summary: "Junior developer interested in backend development"
  },
  {
    id: "C007",
    name: "Priya garg",
    email: "preeti@gmail.com",
    experience_years: 7,
    location: "Bangalore",
    profile_summary: "Senior frontend and architecture specialist"
  },
  {
    id: "C008",
    name: "Vikram Singh",
    email: "vikram@example.com",
    experience_years: 3,
    location: "Hyderabad",
    profile_summary: "Node.js and cloud application developer"
  },
  {
    id: "C009",
    name: "Himanshu",
    email: "himan@gmail.com",
    experience_years: 4,
    location: "Kochi",
    profile_summary: "Python and data platform developer"
  },
  {
    id: "C010",
    name: "shabab Ali",
    email: "shabab@gmail.com",
    experience_years: 2,
    location: "Pune",
    profile_summary: "JavaScript developer focused on web platforms"
  }
];

const skills = [
  { id: "S001", name: "JavaScript", category: "Programming" },
  { id: "S002", name: "React", category: "Frontend" },
  { id: "S003", name: "Node.js", category: "Backend" },
  { id: "S004", name: "Python", category: "Programming" },
  { id: "S005", name: "Java", category: "Programming" },
  { id: "S006", name: "SQL", category: "Database" },
  { id: "S007", name: "PostgreSQL", category: "Database" },
  { id: "S008", name: "Docker", category: "DevOps" },
  { id: "S009", name: "AWS", category: "Cloud" },
  { id: "S010", name: "Git", category: "Tools" },
  { id: "S011", name: "TypeScript", category: "Programming" },
  { id: "S012", name: "REST APIs", category: "Backend" }
];

const companies = [
  {
    id: "CO001",
    name: "TechNova",
    industry: "Software",
    location: "Bangalore"
  },
  {
    id: "CO002",
    name: "FinStack",
    industry: "FinTech",
    location: "Hyderabad"
  },
  {
    id: "CO003",
    name: "HealthSphere",
    industry: "Healthcare Technology",
    location: "Pune"
  },
  {
    id: "CO004",
    name: "CloudWorks",
    industry: "Cloud Services",
    location: "Mumbai"
  }
];

const jobs = [
  {
    id: "J001",
    title: "Full Stack Developer",
    description: "Build and maintain modern web applications",
    experience_required: 2,
    location: "Bangalore",
    employment_type: "Full-time"
  },
  {
    id: "J002",
    title: "Backend Developer",
    description: "Develop scalable backend services and APIs",
    experience_required: 3,
    location: "Hyderabad",
    employment_type: "Full-time"
  },
  {
    id: "J003",
    title: "Frontend Developer",
    description: "Create responsive and accessible web interfaces",
    experience_required: 2,
    location: "Pune",
    employment_type: "Full-time"
  },
  {
    id: "J004",
    title: "Cloud Engineer",
    description: "Build and manage cloud infrastructure",
    experience_required: 4,
    location: "Mumbai",
    employment_type: "Full-time"
  },
  {
    id: "J005",
    title: "Python Developer",
    description: "Develop Python-based backend applications",
    experience_required: 2,
    location: "Pune",
    employment_type: "Full-time"
  },
  {
    id: "J006",
    title: "Software Engineer",
    description: "Develop reliable software products",
    experience_required: 3,
    location: "Bangalore",
    employment_type: "Full-time"
  }
];

const projects = [
  {
    id: "P001",
    name: "E-Commerce Platform",
    description: "Online shopping platform",
    year: 2025
  },
  {
    id: "P002",
    name: "Banking Dashboard",
    description: "Financial analytics dashboard",
    year: 2025
  },
  {
    id: "P003",
    name: "Healthcare Portal",
    description: "Patient management web portal",
    year: 2024
  },
  {
    id: "P004",
    name: "Cloud Monitoring System",
    description: "Cloud infrastructure monitoring platform",
    year: 2025
  },
  {
    id: "P005",
    name: "Learning Platform",
    description: "Online education platform",
    year: 2024
  },
  {
    id: "P006",
    name: "Inventory System",
    description: "Inventory management application",
    year: 2025
  },
  {
    id: "P007",
    name: "Analytics Platform",
    description: "Business analytics application",
    year: 2024
  },
  {
    id: "P008",
    name: "Recruitment Portal",
    description: "Candidate and job management platform",
    year: 2025
  }
];

const technologies = [
  { id: "T001", name: "React", category: "Frontend" },
  { id: "T002", name: "Node.js", category: "Backend" },
  { id: "T003", name: "Python", category: "Backend" },
  { id: "T004", name: "PostgreSQL", category: "Database" },
  { id: "T005", name: "Docker", category: "DevOps" },
  { id: "T006", name: "AWS", category: "Cloud" },
  { id: "T007", name: "TypeScript", category: "Programming" },
  { id: "T008", name: "Java", category: "Backend" },
  { id: "T009", name: "Redis", category: "Database" },
  { id: "T010", name: "GitHub Actions", category: "DevOps" }
];

async function seedNodes() {
  const session = driver.session();

  try {
    console.log("🌱 Starting JobGraph seed...");

    await session.run(
      `
      UNWIND $candidates AS candidate
      MERGE (c:Candidate {id: candidate.id})
      SET c.name = candidate.name,
          c.email = candidate.email,
          c.experience_years = candidate.experience_years,
          c.location = candidate.location,
          c.profile_summary = candidate.profile_summary
      `,
      { candidates }
    );

    await session.run(
      `
      UNWIND $skills AS skill
      MERGE (s:Skill {id: skill.id})
      SET s.name = skill.name,
          s.category = skill.category
      `,
      { skills }
    );

    await session.run(
      `
      UNWIND $companies AS company
      MERGE (c:Company {id: company.id})
      SET c.name = company.name,
          c.industry = company.industry,
          c.location = company.location
      `,
      { companies }
    );

    await session.run(
      `
      UNWIND $jobs AS job
      MERGE (j:Job {id: job.id})
      SET j.title = job.title,
          j.description = job.description,
          j.experience_required = job.experience_required,
          j.location = job.location,
          j.employment_type = job.employment_type
      `,
      { jobs }
    );

    await session.run(
      `
      UNWIND $projects AS project
      MERGE (p:Project {id: project.id})
      SET p.name = project.name,
          p.description = project.description,
          p.year = project.year
      `,
      { projects }
    );

    await session.run(
      `
      UNWIND $technologies AS technology
      MERGE (t:Technology {id: technology.id})
      SET t.name = technology.name,
          t.category = technology.category
      `,
      { technologies }
    );

    console.log("✅ Nodes created successfully.");
  } catch (error) {
    console.error("❌ Seed failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seedNodes();