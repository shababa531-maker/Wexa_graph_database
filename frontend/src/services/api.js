import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCandidates = async () => {
  const response = await api.get("/candidates");
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

export const getJobCandidates = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/candidates`);
  return response.data;
};

export const getCandidateMatches = async (candidateId) => {
  const response = await api.get(`/candidates/${candidateId}/matches`);
  return response.data;
};

export default api;