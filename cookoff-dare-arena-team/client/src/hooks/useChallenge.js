import { useEffect, useState } from "react";
import { getChallengeById } from "../api/challengeApi";
export const useChallenge = (challengeId) => {
  const [challenge, setChallenge] = useState(null),
    [campaign, setCampaign] = useState(null),
    [shareLink, setShareLink] = useState(""),
    [votingLink, setVotingLink] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = async () => {
    try {
      setLoading(true);
      const data = await getChallengeById(challengeId);
      setChallenge(data.challenge);
      setCampaign(data.campaign);
      setShareLink(data.shareLink);
      setVotingLink(data.votingLink || data.shareLink);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (challengeId) reload();
  }, [challengeId]);
  return { challenge, campaign, shareLink, votingLink, loading, error, reload };
};
