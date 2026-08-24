MATCH (c:Candidate)-[r:HAS_SKILL]->(s:Skill)
RETURN c.name AS candidate,
       s.name AS skill,
       r.proficiency AS proficiency
ORDER BY candidate;




MATCH (j:Job)-[r:REQUIRES]->(s:Skill)
RETURN j.title AS job,
       s.name AS skill,
       r.level AS required_level,
       r.mandatory AS mandatory
ORDER BY job;




MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
RETURN c.name AS candidate,
       j.title AS job,
       collect(s.name) AS matching_skills
ORDER BY candidate;





MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)-[:OFFERED_BY]->(company:Company)
RETURN c.name AS candidate,
       j.title AS job,
       company.name AS company,
       collect(s.name) AS matching_skills
ORDER BY candidate, company;






MATCH (c:Candidate)-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
WITH c, j, count(DISTINCT s) AS matched_skills
MATCH (j)-[:REQUIRES]->(required:Skill)
WITH c, j, matched_skills, count(required) AS total_required
RETURN
    c.name AS candidate,
    j.title AS job,
    matched_skills,
    total_required,
    round(
      100.0 * matched_skills / total_required,
      1
    ) AS match_percentage
WHERE matched_skills > 0
ORDER BY match_percentage DESC;