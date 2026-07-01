import { useState } from "react";
import { submitVote } from "../api/voteApi";
import { getBrowserId } from "../utils/localVoteCheck";
export const useVoting = (challengeId) => {
  const [voting, setVoting] = useState(false),
    [voteResult, setVoteResult] = useState(null);
  const vote = async ({ votedForId, voterName, voterContact }) => {
    setVoting(true);
    try {
      const data = await submitVote({
        challengeId,
        votedForId,
        voterName,
        voterContact,
        browserId: getBrowserId(),
      });
      setVoteResult(data);
      return data;
    } finally {
      setVoting(false);
    }
  };
  return { vote, voting, voteResult };
};
