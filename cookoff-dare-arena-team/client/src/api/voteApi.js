import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const submitVote = async (payload) =>
  (await axios.post(`${API_BASE_URL}/votes/${payload.challengeId}`, payload))
    .data;
export const getResults = async (challengeId) =>
  (await axios.get(`${API_BASE_URL}/results/${challengeId}`)).data;
export const getLeaderboard = async (campaignId) =>
  (await axios.get(`${API_BASE_URL}/leaderboard/${campaignId}`)).data;
