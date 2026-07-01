import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const createChallenge = async (payload) =>
  (await axios.post(`${API_BASE_URL}/challenges/create`, payload)).data;
export const getChallengeById = async (challengeId) =>
  (await axios.get(`${API_BASE_URL}/challenges/${challengeId}`)).data;
export const acceptChallenge = async (challengeId, payload) =>
  (
    await axios.post(
      `${API_BASE_URL}/challenges/${challengeId}/accept`,
      payload,
    )
  ).data;
export const addTeamMember = async (challengeId, teamId, payload) =>
  (
    await axios.post(
      `${API_BASE_URL}/challenges/${challengeId}/teams/${teamId}/members`,
      payload,
    )
  ).data;
