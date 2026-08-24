# JobGraph — Job & Skill Relationship Explorer

A graph-powered web application built for the **WEXA AI CognoDB Take-Home Assignment**.

JobGraph helps users explore relationships between candidates, skills, jobs, and companies using **CognoDB**, a managed graph database compatible with the Neo4j driver and openCypher.

---

## Live Demo

### Frontend — Vercel

**Vercel URL:**  
`YOUR_VERCEL_URL`

### Backend API — Render

https://wexa-graph-database.onrender.com

### GitHub Repository

https://github.com/shababa531-maker/Wexa_graph_database

---

# Project Overview

JobGraph is a **Job & Skill Relationship Explorer** designed to demonstrate how graph databases can be used to model and query highly connected recruitment data.

The application connects:

- Candidates
- Skills
- Jobs
- Companies

Instead of treating these entities as isolated records, JobGraph represents their relationships directly in a graph.

For example:

```text
Candidate
    |
    | HAS_SKILL
    ↓
  Skill
    ↑
    | REQUIRES
    |
   Job
    |
    | POSTED_BY
    ↓
  Company