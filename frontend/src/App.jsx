import { useEffect, useState } from "react";
import "./App.css";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =====================================================
   MAIN APP
===================================================== */

function App() {
  // =====================================================
  // MAIN STATE
  // =====================================================

  const [activePage, setActivePage] = useState("dashboard");

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [candidateSkills, setCandidateSkills] = useState([]);
  const [candidateMatches, setCandidateMatches] = useState([]);

  const [jobSkills, setJobSkills] = useState([]);
  const [jobCandidates, setJobCandidates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // ADD PERSON STATE
  // =====================================================

  const [showAddPerson, setShowAddPerson] = useState(false);

  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    experience_years: "",
    location: "",
    profile_summary: "",
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    proficiency: "",
    years: "",
  });

  const [newPersonSkills, setNewPersonSkills] = useState([]);
  const [savingPerson, setSavingPerson] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState(null);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [candidateResponse, jobResponse] = await Promise.all([
        fetch(`${API_URL}/candidates`),
        fetch(`${API_URL}/jobs`),
      ]);

      if (!candidateResponse.ok) {
        throw new Error(
          `Unable to load candidates (${candidateResponse.status})`
        );
      }

      if (!jobResponse.ok) {
        throw new Error(
          `Unable to load jobs (${jobResponse.status})`
        );
      }

      const candidateData = await readResponse(candidateResponse);
      const jobData = await readResponse(jobResponse);

      setCandidates(candidateData.data || []);
      setJobs(jobData.data || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.message || "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SAFE RESPONSE READER
  // =====================================================

  async function readResponse(response) {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();

    return {
      message:
        text ||
        `Server returned HTTP ${response.status}`,
    };
  }

  // =====================================================
  // SELECT CANDIDATE
  // =====================================================

  async function selectCandidate(candidate) {
    try {
      setSelectedCandidate(candidate);
      setSelectedJob(null);

      setDetailsLoading(true);
      setError("");

      const [skillsResponse, matchesResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/candidates/${candidate.id}/skills`
          ),
          fetch(
            `${API_URL}/candidates/${candidate.id}/matches`
          ),
        ]);

      if (!skillsResponse.ok) {
        throw new Error(
          `Unable to load candidate skills (${skillsResponse.status})`
        );
      }

      if (!matchesResponse.ok) {
        throw new Error(
          `Unable to load candidate matches (${matchesResponse.status})`
        );
      }

      const skillsData =
        await readResponse(skillsResponse);

      const matchesData =
        await readResponse(matchesResponse);

      setCandidateSkills(
        skillsData.data || []
      );

      setCandidateMatches(
        matchesData.data || []
      );
    } catch (err) {
      console.error(
        "Candidate relationship error:",
        err
      );

      setError(
        err.message ||
          "Unable to load candidate relationships"
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // =====================================================
  // SELECT JOB
  // =====================================================

  async function selectJob(job) {
    try {
      setSelectedJob(job);
      setSelectedCandidate(null);

      setDetailsLoading(true);
      setError("");

      const [skillsResponse, candidatesResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/jobs/${job.id}/skills`
          ),
          fetch(
            `${API_URL}/jobs/${job.id}/candidates`
          ),
        ]);

      if (!skillsResponse.ok) {
        throw new Error(
          `Unable to load job skills (${skillsResponse.status})`
        );
      }

      if (!candidatesResponse.ok) {
        throw new Error(
          `Unable to load matching candidates (${candidatesResponse.status})`
        );
      }

      const skillsData =
        await readResponse(skillsResponse);

      const candidatesData =
        await readResponse(candidatesResponse);

      setJobSkills(
        skillsData.data || []
      );

      setJobCandidates(
        candidatesData.data || []
      );
    } catch (err) {
      console.error(
        "Job relationship error:",
        err
      );

      setError(
        err.message ||
          "Unable to load job relationships"
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // =====================================================
  // CLEAR SELECTION
  // =====================================================

  function clearSelection() {
    setSelectedCandidate(null);
    setSelectedJob(null);

    setCandidateSkills([]);
    setCandidateMatches([]);

    setJobSkills([]);
    setJobCandidates([]);
  }

  // =====================================================
  // OPEN CANDIDATE
  // =====================================================

  function openCandidate(candidate) {
    setActivePage("candidates");
    selectCandidate(candidate);
  }

  // =====================================================
  // OPEN JOB
  // =====================================================

  function openJob(job) {
    setActivePage("jobs");
    selectJob(job);
  }

  // =====================================================
  // DELETE CANDIDATE
  //
  // IMPORTANT:
  // Backend must provide:
  //
  // DELETE /api/candidates/:id
  //
  // =====================================================

  async function handleDeleteCandidate(candidateId) {
    const candidate = candidates.find(
      (item) => item.id === candidateId
    );

    if (!candidate) {
      console.warn(
        "Candidate not found:",
        candidateId
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${candidate.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingCandidateId(candidateId);

      console.log(
        `Deleting candidate: ${candidateId}`
      );

      const response = await fetch(
        `${API_URL}/candidates/${encodeURIComponent(
          candidateId
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      /*
       * Safely handle JSON OR HTML/text response.
       */
      const data = await readResponse(response);

      /*
       * IMPORTANT:
       * If backend does not have the DELETE route,
       * this will show a useful error instead of
       * crashing while parsing response JSON.
       */
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `DELETE endpoint not found: ${API_URL}/candidates/${candidateId}. Add a DELETE /api/candidates/:id route to the backend.`
          );
        }

        throw new Error(
          data.message ||
            `Failed to delete candidate. Server returned ${response.status}.`
        );
      }

      // =================================================
      // REMOVE FROM FRONTEND
      // =================================================

      setCandidates((prev) =>
        prev.filter(
          (item) => item.id !== candidateId
        )
      );

      // =================================================
      // CLEAR SELECTED CANDIDATE
      // =================================================

      if (
        selectedCandidate?.id === candidateId
      ) {
        setSelectedCandidate(null);
        setCandidateSkills([]);
        setCandidateMatches([]);
      }

      alert(
        data.message ||
          "Candidate deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete candidate error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete candidate."
      );

      alert(
        err.message ||
          "Failed to delete candidate."
      );
    } finally {
      setDeletingCandidateId(null);
    }
  }

  // =====================================================
  // ADD SKILL
  // =====================================================

  function addSkill() {
    if (!newSkill.name.trim()) {
      alert("Please enter a skill name.");
      return;
    }

    if (!newSkill.proficiency) {
      alert("Please select proficiency.");
      return;
    }

    if (!newSkill.years) {
      alert("Please enter years.");
      return;
    }

    const skillExists = newPersonSkills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        newSkill.name
          .trim()
          .toLowerCase()
    );

    if (skillExists) {
      alert(
        "This skill has already been added."
      );
      return;
    }

    setNewPersonSkills((prev) => [
      ...prev,
      {
        name: newSkill.name.trim(),
        category:
          newSkill.category.trim() ||
          "General",
        proficiency:
          newSkill.proficiency,
        years: Number(newSkill.years),
      },
    ]);

    setNewSkill({
      name: "",
      category: "",
      proficiency: "",
      years: "",
    });
  }

  // =====================================================
  // REMOVE SKILL
  // =====================================================

  function removeSkill(index) {
    setNewPersonSkills((prev) =>
      prev.filter(
        (_, skillIndex) =>
          skillIndex !== index
      )
    );
  }

  // =====================================================
  // RESET PERSON FORM
  // =====================================================

  function resetPersonForm() {
    setNewPerson({
      name: "",
      email: "",
      experience_years: "",
      location: "",
      profile_summary: "",
    });

    setNewSkill({
      name: "",
      category: "",
      proficiency: "",
      years: "",
    });

    setNewPersonSkills([]);
    setSavingPerson(false);
  }

  // =====================================================
  // CREATE PERSON
  // =====================================================

  async function handleCreatePerson(e) {
    e.preventDefault();

    if (!newPerson.name.trim()) {
      alert("Please enter candidate name.");
      return;
    }

    if (!newPerson.email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (!newPerson.location.trim()) {
      alert("Please enter location.");
      return;
    }

    if (newPersonSkills.length === 0) {
      alert(
        "Please add at least one skill."
      );
      return;
    }

    try {
      setSavingPerson(true);
      setError("");

      const response = await fetch(
        `${API_URL}/candidates`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: newPerson.name.trim(),
            email: newPerson.email.trim(),
            experience_years: Number(
              newPerson.experience_years || 0
            ),
            location:
              newPerson.location.trim(),
            profile_summary:
              newPerson.profile_summary.trim(),
            skills: newPersonSkills,
          }),
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to create candidate (${response.status})`
        );
      }

      alert(
        "Candidate created successfully."
      );

      const createdCandidate =
        data.data;

      resetPersonForm();
      setShowAddPerson(false);

      await loadDashboard();

      if (createdCandidate) {
        setTimeout(() => {
          openCandidate(
            createdCandidate
          );
        }, 100);
      }
    } catch (err) {
      console.error(
        "Create candidate error:",
        err
      );

      setError(
        err.message ||
          "Unable to create candidate."
      );

      alert(
        err.message ||
          "Unable to create candidate."
      );
    } finally {
      setSavingPerson(false);
    }
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>

        <h3>
          Connecting to JobGraph
        </h3>

        <p>
          Loading graph data from
          CognoDB...
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            JG
          </div>

          <div>
            <h1>JobGraph</h1>

            <span>
              Relationship Explorer
            </span>
          </div>
        </div>

        <div className="nav-section">
          <p>EXPLORE</p>

          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage(
                "dashboard"
              );

              clearSelection();
              setShowAddPerson(false);
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "candidates"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage(
                "candidates"
              );

              clearSelection();
              setShowAddPerson(false);
            }}
          >
            <span>◉</span>
            Candidates
          </button>

          <button
            className={`nav-item ${
              activePage === "jobs"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("jobs");

              clearSelection();
              setShowAddPerson(false);
            }}
          >
            <span>▣</span>
            Jobs
          </button>
        </div>

        <div className="nav-section second">
          <p>GRAPH</p>

          <div className="graph-menu-item">
            <span className="purple-dot"></span>
            Candidates
          </div>

          <div className="graph-menu-item">
            <span className="green-dot"></span>
            Skills
          </div>

          <div className="graph-menu-item">
            <span className="orange-dot"></span>
            Jobs
          </div>

          <div className="graph-menu-item">
            <span className="blue-dot"></span>
            Companies
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="connection-dot"></div>

          <div>
            <strong>CognoDB</strong>

            <span>Connected</span>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div>
            <p className="eyebrow">
              GRAPH DATABASE EXPLORER
            </p>

            <h2>
              {activePage === "jobs"
                ? "Explore job relationships"
                : activePage ===
                  "candidates"
                ? "Explore candidate relationships"
                : "Discover talent connections"}
            </h2>

            <p className="subtitle">
              {activePage === "jobs"
                ? "Find candidates through skills connected to each job."
                : activePage ===
                  "candidates"
                ? "Explore candidate skills and matching opportunities."
                : "Explore how candidates, skills, jobs and companies connect."}
            </p>
          </div>

          <div className="topbar-status">
            <span className="status-dot"></span>
            CognoDB Live
          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="error-box">

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activePage ===
          "dashboard" && (
          <>

            <section className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon purple">
                  ◉
                </div>

                <span className="stat-label">
                  Candidates
                </span>

                <strong>
                  {candidates.length}
                </strong>

                <span className="stat-description">
                  Profiles in the graph
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  ▣
                </div>

                <span className="stat-label">
                  Open Jobs
                </span>

                <strong>
                  {jobs.length}
                </strong>

                <span className="stat-description">
                  Opportunities to explore
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  ◆
                </div>

                <span className="stat-label">
                  Database
                </span>

                <strong>
                  Live
                </strong>

                <span className="stat-description">
                  Powered by CognoDB
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  ↗
                </div>

                <span className="stat-label">
                  Traversal
                </span>

                <strong>
                  2-hop+
                </strong>

                <span className="stat-description">
                  Relationship matching
                </span>
              </div>

            </section>

            <section className="dashboard-grid">

              {/* CANDIDATES */}

              <div className="panel">

                <div className="panel-header">

                  <div>
                    <p className="panel-kicker">
                      CANDIDATES
                    </p>

                    <h3>
                      Talent in the graph
                    </h3>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => {
                      setActivePage(
                        "candidates"
                      );

                      setShowAddPerson(
                        false
                      );
                    }}
                  >
                    View all →
                  </button>

                </div>

                <div className="candidate-list">

                  {candidates
                    .slice(0, 5)
                    .map(
                      (candidate) => (
                        <div
                          className={`candidate-card ${
                            selectedCandidate?.id ===
                            candidate.id
                              ? "selected"
                              : ""
                          }`}
                          key={
                            candidate.id
                          }
                        >

                          <button
                            type="button"
                            className="candidate-card-main"
                            onClick={() =>
                              openCandidate(
                                candidate
                              )
                            }
                          >

                            <div className="avatar">
                              {getInitials(
                                candidate.name
                              )}
                            </div>

                            <div className="candidate-info">

                              <strong>
                                {
                                  candidate.name
                                }
                              </strong>

                              <span>
                                {
                                  candidate.location
                                }
                              </span>

                            </div>

                            <span className="arrow">
                              →
                            </span>

                          </button>

                          <button
                            type="button"
                            className="delete-candidate-button"
                            disabled={
                              deletingCandidateId ===
                              candidate.id
                            }
                            onClick={() =>
                              handleDeleteCandidate(
                                candidate.id
                              )
                            }
                          >
                            {deletingCandidateId ===
                            candidate.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      )
                    )}

                </div>

              </div>

              {/* JOBS */}

              <div className="panel">

                <div className="panel-header">

                  <div>
                    <p className="panel-kicker">
                      OPPORTUNITIES
                    </p>

                    <h3>
                      Available jobs
                    </h3>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => {
                      setActivePage(
                        "jobs"
                      );

                      setShowAddPerson(
                        false
                      );
                    }}
                  >
                    View all →
                  </button>

                </div>

                <div className="job-list">

                  {jobs
                    .slice(0, 5)
                    .map((job) => (
                      <button
                        type="button"
                        key={job.id}
                        className="job-card"
                        onClick={() =>
                          openJob(job)
                        }
                      >

                        <div className="job-icon">
                          ▣
                        </div>

                        <div className="job-info">

                          <strong>
                            {job.title}
                          </strong>

                          <span>
                            {job.company
                              ?.name ||
                              "Company"}
                          </span>

                        </div>

                        <span className="arrow">
                          →
                        </span>

                      </button>
                    ))}

                </div>

              </div>

            </section>

            {/* GRAPH EXPLANATION */}

            <section className="panel graph-explanation">

              <div className="graph-copy">

                <p className="panel-kicker">
                  WHY GRAPH?
                </p>

                <h3>
                  Follow relationships,
                  not rows.
                </h3>

                <p>
                  JobGraph uses connected
                  data to discover relevant
                  opportunities by
                  traversing candidates,
                  skills, jobs and
                  companies.
                </p>

              </div>

              <div className="graph-path">

                <div className="graph-node candidate-node">
                  <span>●</span>
                  Candidate
                </div>

                <div className="graph-line">
                  →
                </div>

                <div className="graph-node skill-node">
                  <span>◆</span>
                  Skill
                </div>

                <div className="graph-line">
                  →
                </div>

                <div className="graph-node job-node">
                  <span>■</span>
                  Job
                </div>

                <div className="graph-line">
                  →
                </div>

                <div className="graph-node company-node">
                  <span>▲</span>
                  Company
                </div>

              </div>

            </section>

          </>
        )}

        {/* =================================================
            CANDIDATES PAGE
        ================================================= */}

        {activePage ===
          "candidates" && (
          <>

            {/* ADD PERSON BUTTON */}

            <div className="candidate-page-actions">

              <button
                className="submit-person-button"
                onClick={() =>
                  setShowAddPerson(true)
                }
              >
                + Add New Person
              </button>

            </div>

            {/* ADD PERSON FORM */}

            {showAddPerson && (
              <section className="panel add-person-panel">

                <div className="panel-header">

                  <div>
                    <p className="panel-kicker">
                      CANDIDATE MANAGEMENT
                    </p>

                    <h3>
                      Add New Person
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setShowAddPerson(
                        false
                      );

                      resetPersonForm();
                    }}
                  >
                    Close
                  </button>

                </div>

                <form
                  className="add-person-form"
                  onSubmit={
                    handleCreatePerson
                  }
                >

                  {/* PERSONAL INFORMATION */}

                  <div className="form-section">

                    <h4>
                      Personal Information
                    </h4>

                    <p>
                      Enter the basic
                      information for the
                      new candidate.
                    </p>

                    <div className="form-grid">

                      <div className="form-group">

                        <label>
                          Name
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. Shabab Ali"
                          value={
                            newPerson.name
                          }
                          onChange={(e) =>
                            setNewPerson({
                              ...newPerson,
                              name: e.target
                                .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Email
                        </label>

                        <input
                          type="email"
                          placeholder="e.g. shabab@example.com"
                          value={
                            newPerson.email
                          }
                          onChange={(e) =>
                            setNewPerson({
                              ...newPerson,
                              email: e.target
                                .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Experience Years
                        </label>

                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 2"
                          value={
                            newPerson.experience_years
                          }
                          onChange={(e) =>
                            setNewPerson({
                              ...newPerson,
                              experience_years:
                                e.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Location
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={
                            newPerson.location
                          }
                          onChange={(e) =>
                            setNewPerson({
                              ...newPerson,
                              location:
                                e.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-group full">

                        <label>
                          Profile Summary
                        </label>

                        <textarea
                          placeholder="Describe the candidate..."
                          value={
                            newPerson.profile_summary
                          }
                          onChange={(e) =>
                            setNewPerson({
                              ...newPerson,
                              profile_summary:
                                e.target
                                  .value,
                            })
                          }
                        />

                      </div>

                    </div>

                  </div>

                  {/* SKILLS */}

                  <div className="form-section skills-form-section">

                    <h4>
                      Skills
                    </h4>

                    <p>
                      Add the skills this
                      candidate has.
                      These skills will
                      be connected to the
                      candidate in the
                      graph.
                    </p>

                    <div className="skill-input-row">

                      <div className="skill-input-group">

                        <label>
                          Skill Name
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. React"
                          value={
                            newSkill.name
                          }
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              name: e.target
                                .value,
                            })
                          }
                        />

                      </div>

                      <div className="skill-input-group">

                        <label>
                          Category
                        </label>

                        <input
                          type="text"
                          placeholder="e.g. Frontend"
                          value={
                            newSkill.category
                          }
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              category:
                                e.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <div className="skill-input-group">

                        <label>
                          Proficiency
                        </label>

                        <select
                          value={
                            newSkill.proficiency
                          }
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              proficiency:
                                e.target
                                  .value,
                            })
                          }
                        >

                          <option value="">
                            Select
                          </option>

                          <option value="Beginner">
                            Beginner
                          </option>

                          <option value="Intermediate">
                            Intermediate
                          </option>

                          <option value="Advanced">
                            Advanced
                          </option>

                          <option value="Expert">
                            Expert
                          </option>

                        </select>

                      </div>

                      <div className="skill-input-group">

                        <label>
                          Years
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="2"
                          value={
                            newSkill.years
                          }
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              years:
                                e.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <button
                        type="button"
                        className="add-skill-button"
                        onClick={addSkill}
                      >
                        + Add Skill
                      </button>

                    </div>

                    {/* ADDED SKILLS */}

                    <div className="added-skills">

                      <div className="added-skills-title">
                        Added Skills (
                        {
                          newPersonSkills.length
                        }
                        )
                      </div>

                      {newPersonSkills.length ===
                      0 ? (
                        <div className="no-skills">
                          No skills added yet.
                        </div>
                      ) : (
                        <div className="added-skills-list">

                          {newPersonSkills.map(
                            (
                              skill,
                              index
                            ) => (
                              <div
                                className="added-skill"
                                key={`${skill.name}-${index}`}
                              >

                                <div className="added-skill-info">

                                  <strong>
                                    {
                                      skill.name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      skill.category
                                    }{" "}
                                    •{" "}
                                    {
                                      skill.proficiency
                                    }{" "}
                                    •{" "}
                                    {
                                      skill.years
                                    }{" "}
                                    years
                                  </span>

                                </div>

                                <button
                                  type="button"
                                  className="remove-skill-button"
                                  onClick={() =>
                                    removeSkill(
                                      index
                                    )
                                  }
                                >
                                  ×
                                </button>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="form-actions">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setShowAddPerson(
                          false
                        );

                        resetPersonForm();
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="submit-person-button"
                      disabled={
                        savingPerson
                      }
                    >
                      {savingPerson
                        ? "Creating..."
                        : "Create Person"}
                    </button>

                  </div>

                </form>

              </section>
            )}

            {/* CANDIDATE EXPLORER */}

            <section className="explorer-layout">

              {/* CANDIDATE LIST */}

              <div className="panel explorer-list">

                <div className="panel-header">

                  <div>
                    <p className="panel-kicker">
                      CANDIDATES
                    </p>

                    <h3>
                      Select a candidate
                    </h3>
                  </div>

                  <span className="count-badge">
                    {
                      candidates.length
                    }
                  </span>

                </div>

                <div className="candidate-list">

                  {candidates.map(
                    (candidate) => (
                      <div
                        className={`candidate-card ${
                          selectedCandidate?.id ===
                          candidate.id
                            ? "selected"
                            : ""
                        }`}
                        key={
                          candidate.id
                        }
                      >

                        <button
                          type="button"
                          className="candidate-card-main"
                          onClick={() =>
                            selectCandidate(
                              candidate
                            )
                          }
                        >

                          <div className="avatar">
                            {getInitials(
                              candidate.name
                            )}
                          </div>

                          <div className="candidate-info">

                            <strong>
                              {
                                candidate.name
                              }
                            </strong>

                            <span>
                              {
                                candidate.location
                              }
                            </span>

                          </div>

                          <span className="arrow">
                            →
                          </span>

                        </button>

                        <button
                          type="button"
                          className="delete-candidate-button"
                          disabled={
                            deletingCandidateId ===
                            candidate.id
                          }
                          onClick={(e) => {
                            e.stopPropagation();

                            handleDeleteCandidate(
                              candidate.id
                            );
                          }}
                        >
                          {deletingCandidateId ===
                          candidate.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* DETAILS */}

              <div className="panel details-panel">

                {!selectedCandidate ? (
                  <EmptyState
                    icon="◎"
                    title="Select a candidate"
                    text="Choose a candidate to explore their skills and discover matching jobs through the graph."
                  />
                ) : detailsLoading ? (
                  <LoadingState
                    text="Exploring candidate relationships..."
                  />
                ) : (
                  <CandidateDetails
                    candidate={
                      selectedCandidate
                    }
                    skills={
                      candidateSkills
                    }
                    matches={
                      candidateMatches
                    }
                    onJobSelect={(
                      jobId
                    ) => {
                      const job =
                        jobs.find(
                          (item) =>
                            item.id ===
                            jobId
                        );

                      if (job) {
                        openJob(job);
                      }
                    }}
                    onDelete={() =>
                      handleDeleteCandidate(
                        selectedCandidate.id
                      )
                    }
                  />
                )}

              </div>

            </section>

          </>
        )}

        {/* =================================================
            JOBS PAGE
        ================================================= */}

        {activePage === "jobs" && (
          <section className="explorer-layout">

            <div className="panel explorer-list">

              <div className="panel-header">

                <div>
                  <p className="panel-kicker">
                    JOBS
                  </p>

                  <h3>
                    Select a job
                  </h3>
                </div>

                <span className="count-badge">
                  {jobs.length}
                </span>

              </div>

              <div className="job-list">

                {jobs.map((job) => (
                  <button
                    type="button"
                    key={job.id}
                    className={`job-card ${
                      selectedJob?.id ===
                      job.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectJob(job)
                    }
                  >

                    <div className="job-icon">
                      ▣
                    </div>

                    <div className="job-info">

                      <strong>
                        {job.title}
                      </strong>

                      <span>
                        {job.company
                          ?.name ||
                          "Company"}
                      </span>

                    </div>

                    <span className="arrow">
                      →
                    </span>

                  </button>
                ))}

              </div>

            </div>

            <div className="panel details-panel">

              {!selectedJob ? (
                <EmptyState
                  icon="▣"
                  title="Select a job"
                  text="Choose a job to see required skills and candidates connected through the graph."
                />
              ) : detailsLoading ? (
                <LoadingState
                  text="Exploring job relationships..."
                />
              ) : (
                <JobDetails
                  job={selectedJob}
                  skills={jobSkills}
                  candidates={
                    jobCandidates
                  }
                  onCandidateSelect={(
                    candidateId
                  ) => {
                    const candidate =
                      candidates.find(
                        (item) =>
                          item.id ===
                          candidateId
                      );

                    if (candidate) {
                      openCandidate(
                        candidate
                      );
                    }
                  }}
                />
              )}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

/* =====================================================
   CANDIDATE DETAILS
===================================================== */

function CandidateDetails({
  candidate,
  skills,
  matches,
  onJobSelect,
  onDelete,
}) {
  return (
    <>
      <div className="profile-header">

        <div className="profile-avatar">
          {getInitials(
            candidate.name
          )}
        </div>

        <div>

          <p className="panel-kicker">
            CANDIDATE PROFILE
          </p>

          <h3>
            {candidate.name}
          </h3>

          <p className="profile-location">
            {candidate.location} ·{" "}
            {candidate.experience_years}{" "}
            years experience
          </p>

          <p className="profile-summary">
            {candidate.profile_summary ||
              "Candidate profile available in the graph."}
          </p>

          <button
            type="button"
            className="delete-candidate-button"
            onClick={onDelete}
          >
            Delete Candidate
          </button>

        </div>

      </div>

      {/* SKILLS */}

      <div className="section">

        <div className="section-title">

          <h4>
            Connected skills
          </h4>

          <span>
            {skills.length}
          </span>

        </div>

        <div className="skills">

          {skills.length === 0 ? (
            <div className="empty-small">
              No skills connected.
            </div>
          ) : (
            skills.map((skill) => (
              <div
                className="skill"
                key={skill.id}
              >

                <span>
                  {skill.name}
                </span>

                {skill.proficiency && (
                  <small>
                    {
                      skill.proficiency
                    }
                  </small>
                )}

              </div>
            ))
          )}

        </div>

      </div>

      {/* GRAPH */}

      <div className="graph-visual">

        <div className="graph-title">

          <span>
            GRAPH CONNECTION
          </span>

          <strong>
            How this candidate
            connects to
            opportunities
          </strong>

        </div>

        <div className="graph-flow">

          <div className="graph-box candidate-box">

            <span className="graph-box-icon">
              ●
            </span>

            <strong>
              {candidate.name}
            </strong>

            <small>
              Candidate
            </small>

          </div>

          <div className="graph-arrow">
            →
          </div>

          <div className="graph-box skill-box">

            <span className="graph-box-icon">
              ◆
            </span>

            <strong>
              {skills.length} Skills
            </strong>

            <small>
              Connected Skills
            </small>

          </div>

          <div className="graph-arrow">
            →
          </div>

          <div className="graph-box job-box">

            <span className="graph-box-icon">
              ■
            </span>

            <strong>
              {matches.length} Jobs
            </strong>

            <small>
              Matching Jobs
            </small>

          </div>

        </div>

        <div className="traversal-label">
          Graph traversal:
          Candidate → Skill → Job
        </div>

      </div>

      {/* MATCHING JOBS */}

      <div className="section">

        <div className="section-title">

          <h4>
            Recommended jobs
          </h4>

          <span>
            {matches.length}
          </span>

        </div>

        <div className="matches">

          {matches.length === 0 ? (
            <div className="empty-small">
              No matching jobs found.
            </div>
          ) : (
            matches.map((match) => (
              <button
                type="button"
                className="match-card"
                key={match.job_id}
                onClick={() =>
                  onJobSelect(
                    match.job_id
                  )
                }
              >

                <div className="match-main-info">

                  <strong>
                    {match.job_title}
                  </strong>

                  <span>
                    {match.location}
                  </span>

                  <small>
                    {
                      match.matched_skills
                    }{" "}
                    of{" "}
                    {
                      match.total_required
                    }{" "}
                    skills matched
                  </small>

                </div>

                <div className="match-score">

                  <strong>
                    {Number(
                      match.match_percentage ||
                        0
                    ).toFixed(0)}
                    %
                  </strong>

                  <span>
                    match
                  </span>

                </div>

              </button>
            ))
          )}

        </div>

      </div>
    </>
  );
}

/* =====================================================
   JOB DETAILS
===================================================== */

function JobDetails({
  job,
  skills,
  candidates,
  onCandidateSelect,
}) {
  return (
    <>
      <div className="profile-header">

        <div className="profile-avatar job-avatar">
          ▣
        </div>

        <div>

          <p className="panel-kicker">
            JOB OPPORTUNITY
          </p>

          <h3>
            {job.title}
          </h3>

          <p className="profile-location">
            {job.company?.name ||
              "Company"}{" "}
            · {job.location}
          </p>

          <p className="profile-summary">
            {job.description ||
              "Job description available in the graph."}
          </p>

        </div>

      </div>

      {/* JOB META */}

      <div className="job-meta">

        <div>
          <span>
            Experience
          </span>

          <strong>
            {job.experience_required ||
              0}
            + years
          </strong>
        </div>

        <div>
          <span>
            Employment
          </span>

          <strong>
            {job.employment_type ||
              "Full-time"}
          </strong>
        </div>

        <div>
          <span>
            Company
          </span>

          <strong>
            {job.company?.name ||
              "Company"}
          </strong>
        </div>

      </div>

      {/* REQUIRED SKILLS */}

      <div className="section">

        <div className="section-title">

          <h4>
            Required skills
          </h4>

          <span>
            {skills.length}
          </span>

        </div>

        <div className="skills">

          {skills.length === 0 ? (
            <div className="empty-small">
              No required skills found.
            </div>
          ) : (
            skills.map((skill) => (
              <div
                className={`skill ${
                  skill.mandatory
                    ? "mandatory"
                    : ""
                }`}
                key={skill.id}
              >

                <span>
                  {skill.name}
                </span>

                {skill.level && (
                  <small>
                    {skill.level}
                  </small>
                )}

              </div>
            ))
          )}

        </div>

      </div>

      {/* REVERSE GRAPH */}

      <div className="relationship-banner job-banner">

        <div className="relationship-icon">
          ←
        </div>

        <div>

          <strong>
            Reverse graph traversal
          </strong>

          <span>
            Job → Skill → Candidate
          </span>

        </div>

      </div>

      {/* MATCHING CANDIDATES */}

      <div className="section">

        <div className="section-title">

          <h4>
            Matching candidates
          </h4>

          <span>
            {candidates.length}
          </span>

        </div>

        <div className="matches">

          {candidates.length === 0 ? (
            <div className="empty-small">
              No candidates found.
            </div>
          ) : (
            candidates.map(
              (candidate) => (
                <button
                  type="button"
                  className="match-card"
                  key={
                    candidate.candidate_id
                  }
                  onClick={() =>
                    onCandidateSelect(
                      candidate.candidate_id
                    )
                  }
                >

                  <div className="candidate-match-info">

                    <div className="mini-avatar">
                      {getInitials(
                        candidate.candidate_name
                      )}
                    </div>

                    <div className="match-main-info">

                      <strong>
                        {
                          candidate.candidate_name
                        }
                      </strong>

                      <span>
                        {
                          candidate.location
                        }
                      </span>

                      <small>
                        {
                          candidate.matched_skills
                        }{" "}
                        of{" "}
                        {
                          candidate.total_required
                        }{" "}
                        skills matched
                      </small>

                    </div>

                  </div>

                  <div className="match-score">

                    <strong>
                      {Number(
                        candidate.match_percentage ||
                          0
                      ).toFixed(0)}
                      %
                    </strong>

                    <span>
                      match
                    </span>

                  </div>

                </button>
              )
            )
          )}

        </div>

      </div>
    </>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">

      <div className="empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   LOADING STATE
===================================================== */

function LoadingState({
  text,
}) {
  return (
    <div className="empty-state">

      <div className="spinner"></div>

      <p>
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   HELPER
===================================================== */

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) => word[0]
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default App;