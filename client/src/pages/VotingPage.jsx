import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import VotingArena from "../components/VotingArena";
import CouponReveal from "../components/CouponReveal";
import ProductRecommendations from "../components/ProductRecommendations";
import ShareChallenge from "../components/ShareChallenge";
import ShopNowCTA from "../components/ShopNowCTA";
import AcceptedEntries from "../components/AcceptedEntries";
import PremiumLeaderboard from "../components/PremiumLeaderboard";
import WinnerPopup from "../components/WinnerPopup";
import { useChallenge } from "../hooks/useChallenge";
import { useVoting } from "../hooks/useVoting";

function VotingPage() {
  const { challengeId } = useParams();

  const {
    challenge,
    campaign,
    shareLink,
    votingLink,
    winnerRecord,
    loading,
    error,
    reload,
  } = useChallenge(challengeId);

  const { vote, voting, voteResult } = useVoting(challengeId);

  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, 30000);

    return () => clearInterval(interval);
  }, [reload]);

  useEffect(() => {
    if (!challenge || !winnerRecord) return;

    if (challenge.status === "closed") {
      const popupKey = `winner_popup_seen_${challenge.challengeId}`;

      if (!localStorage.getItem(popupKey)) {
        setShowWinnerPopup(true);
      }
    }
  }, [challenge, winnerRecord]);

  const closeWinnerPopup = () => {
    if (challenge?.challengeId) {
      localStorage.setItem(`winner_popup_seen_${challenge.challengeId}`, "yes");
    }

    setShowWinnerPopup(false);
  };

  const handleVote = async ({ votedForId, voterName, voterContact }) => {
    try {
      await vote({ votedForId, voterName, voterContact });
      await reload();
    } catch (err) {
      alert(err.response?.data?.message || "Vote failed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorBox message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-stack">
        {challenge.status === "waiting_opponents" ? (
          <>
            <div className="center-card">
              <div className="badge">Waiting For Entries</div>

              <h1>Voting Is Not Open Yet</h1>

              <p>
                Voting opens after all required{" "}
                {challenge.mode === "team" ? "teams" : "players"} join.
              </p>
            </div>

            <AcceptedEntries challenge={challenge} />

            <ShareChallenge
              shareLink={shareLink}
              message="Join this OmiChef Cook-Off Dare and upload your dish!"
              title="Invite More Entries"
              description="Share this challenge link. Voting opens automatically when everyone joins."
              buttonText="Share Challenge Link"
            />
          </>
        ) : (
          <>
            {challenge.status === "closed" && winnerRecord && (
              <div className="winner-contact-card">
                <div className="winner-contact-icon">🏆</div>

                <div>
                  <h3>Winner reward claim</h3>

                  <p>
                    Congratulations to{" "}
                    <strong>{winnerRecord.winnerName}</strong>. The cook-off
                    result has been declared. Please contact OmiChef on WhatsApp
                    to collect your special winner reward.
                  </p>

                  <a
                    className="winner-contact-btn"
                    href={`https://wa.me/${
                      import.meta.env.VITE_WINNER_WHATSAPP_NUMBER ||
                      "910000000000"
                    }?text=${encodeURIComponent(
                      `Hi OmiChef, I am the winner of the Cook-Off Dare Arena.\n\nWinner Name: ${
                        winnerRecord.winnerName || "Winner"
                      }\nDish: ${
                        winnerRecord.dishName || "Winning dish"
                      }\nVotes: ${
                        winnerRecord.totalVotes || 0
                      }\nChallenge ID: ${
                        challenge.challengeId
                      }\n\nPlease help me claim my special reward.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Claim Winner Reward
                  </a>
                </div>
              </div>
            )}

            <VotingArena
              challenge={challenge}
              onVote={handleVote}
              voting={voting}
            />

            <PremiumLeaderboard challenge={challenge} />

            {voteResult && (
              <CouponReveal
                title="Thanks for voting! Your voter reward"
                code={voteResult.voterCoupon || campaign.coupons.voter}
              />
            )}

            {voteResult?.recommendations && (
              <ProductRecommendations
                recommendations={voteResult.recommendations}
              />
            )}

            <ShareChallenge
              shareLink={votingLink}
              message="Vote in this OmiChef Cook-Off Dare and help choose the winner!"
              title="Share Voting Link"
              description="Send this link to friends and family. One email or mobile number can vote once."
              buttonText="Share Voting Link"
            />

            <ShopNowCTA url={challenge.productCollectionUrl} />
          </>
        )}
      </div>

      {showWinnerPopup && (
        <WinnerPopup
          challenge={challenge}
          winnerRecord={winnerRecord}
          onClose={closeWinnerPopup}
        />
      )}
    </Layout>
  );
}

export default VotingPage;