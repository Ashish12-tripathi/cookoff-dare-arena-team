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
import { useChallenge } from "../hooks/useChallenge";
import { useVoting } from "../hooks/useVoting";
function VotingPage() {
  const { challengeId } = useParams();
  const { challenge, campaign, shareLink, votingLink, loading, error, reload } =
    useChallenge(challengeId);
  const { vote, voting, voteResult } = useVoting(challengeId);
  if (loading)
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <ErrorBox message={error} />
      </Layout>
    );
  const handleVote = async ({ votedForId, voterName, voterContact }) => {
    try {
      await vote({ votedForId, voterName, voterContact });
      await reload();
    } catch (err) {
      alert(err.response?.data?.message || "Vote failed");
    }
  };
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
            )}{" "}
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
    </Layout>
  );
}
export default VotingPage;
