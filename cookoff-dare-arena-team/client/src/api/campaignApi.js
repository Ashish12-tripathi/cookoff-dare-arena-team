import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const getCampaignById = async (campaignId) =>
  (await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`)).data;
