# JobGraph — Job & Skill Relationship Explorer

A graph-powered web application built for the WEXA AI CognoDB take-home assignment.

JobGraph helps users explore relationships between candidates, skills, jobs, and companies using a graph database.

##  Live Demo

Frontend:
YOUR_VERCEL_URL

Backend API:
https://wexa-graph-database.onrender.com

##  GitHub Repository

https://github.com/shababa531-maker/Wexa_graph_database

---

# Use Case

JobGraph is a job and candidate relationship explorer.

Traditional job-search applications often store candidates, jobs, companies, and skills in separate relational tables. However, real recruitment data is highly interconnected.

For example:

Candidate → HAS_SKILL → Skill  
Skill → REQUIRED_BY → Job  
Job → POSTED_BY → Company

JobGraph models these connections directly using a graph database.

The application allows users to:

- Explore candidates
- Explore jobs
- View candidate skills
- View job requirements
- Find suitable jobs for candidates
- Find candidates suitable for jobs
- Explore relationships between candidates, skills, jobs, and companies
- Add and delete candidates
- Create candidates, skills, companies, and jobs

---

# 🧠 Why a Graph Database?

A graph database is a natural fit because the core questions in this application are relationship-based.

For example:

> "Which jobs match this candidate based on their skills?"

This requires traversing:

Candidate → Skill → Job

Another example:

> "Which candidates are suitable for a job?"

This requires:

Job → Skill ← Candidate

With a relational database, these relationships would require multiple tables and JOIN operations.

With CognoDB, these relationships can be represented directly as nodes and relationships.

### Advantages

- Natural representation of interconnected data
- Multi-hop relationship traversal
- Easier relationship-based queries
- Flexible graph structure
- Efficient exploration of connected entities
- Suitable for recommendation and matching use cases

---

# 🏗️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

## Backend

- Node.js
- Express.js
- Neo4j Driver
- REST API

## Database

- CognoDB
- openCypher
- Bolt protocol

## Deployment

- Vercel — Frontend
- Render — Backend
- CognoDB Cloud — Database

---

#Graph Data Model

The main entities are:

- Candidate
- Skill
- Job
- Company

Relationships include:

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