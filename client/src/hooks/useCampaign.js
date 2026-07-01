import { useEffect, useState } from "react";
import { getCampaignById } from "../api/campaignApi";
export const useCampaign = (campaignId) => {
  const [campaign, setCampaign] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCampaignById(campaignId);
        setCampaign(data.campaign);
        setError("");
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);
  return { campaign, loading, error };
};
