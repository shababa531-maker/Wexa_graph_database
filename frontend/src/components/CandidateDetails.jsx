function CandidateDetails({
  candidate,
  skills,
  matches,
  onJobSelect
}) {
  return (
    <>
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(candidate.name)}
        </div>

        <div>
          <p className="panel-kicker">CANDIDATE PROFILE</p>

          <h3>{candidate.name}</h3>

          <p className="profile-location">
            {candidate.location} · {candidate.experience_years} years
            experience
          </p>

          <p className="profile-summary">
            {candidate.profile_summary}
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <h4>Connected skills</h4>
          <span>{skills.length}</span>
        </div>

        <div className="skills">
          {skills.map((skill) => (
            <div className="skill" key={skill.id}>
              <span>{skill.name}</span>

              {skill.proficiency && (
                <small>{skill.proficiency}</small>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relationship-banner">
        <div className="relationship-icon">→</div>

        <div>
          <strong>Graph traversal</strong>

          <span>
            Candidate → Skill → Job
          </span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <h4>Recommended jobs</h4>
          <span>{matches.length}</span>
        </div>

        <div className="matches">
          {matches.length === 0 ? (
            <div className="empty-small">
              No matching jobs found.
            </div>
          ) : (
            matches.map((match) => (
              <button
                className="match-card"
                key={match.job_id}
                onClick={() => onJobSelect(match.job_id)}
              >
                <div>
                  <strong>{match.job_title}</strong>

                  <span>{match.location}</span>

                  <small>
                    {match.matched_skills} of{" "}
                    {match.total_required} skills matched
                  </small>
                </div>

                <div className="match-score">
                  <strong>
                    {Number(match.match_percentage).toFixed(0)}%
                  </strong>

                  <span>match</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default CandidateDetails;