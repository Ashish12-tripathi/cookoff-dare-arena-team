import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import DishUploadForm from "../components/DishUploadForm";
import ShareChallenge from "../components/ShareChallenge";
import AcceptedEntries from "../components/AcceptedEntries";
import { useChallenge } from "../hooks/useChallenge";
import { acceptChallenge } from "../api/challengeApi";
function AcceptChallengePage() {
  const { challengeId } = useParams();
  const { challenge, campaign, shareLink, votingLink, loading, error, reload } =
    useChallenge(challengeId);
  const [acceptedData, setAcceptedData] = useState(null),
    [submitError, setSubmitError] = useState("");
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
  const current = acceptedData?.challenge || challenge;
  const mode = current.mode || "solo";
  const currentVotingLink = acceptedData?.votingLink || votingLink;
  const submit = async (opponent) => {
    try {
      const data = await acceptChallenge(challengeId, { opponent });
      setAcceptedData(data);
      await reload();
    } catch (err) {
      const m = err.response?.data?.message || "Failed to accept challenge";
      alert(m);
      setSubmitError(m);
    }
  };
  return (
    <Layout>
      <div className="page-stack">
        <div className="center-card">
          <div className="badge">{current.dareThemeTitle}</div>
          <h1>
            {current.status === "voting_open"
              ? "Voting Is Live"
              : `Accept ${mode === "team" ? "Team" : "Player"} Challenge`}
          </h1>
          <p>
            {current.status === "voting_open"
              ? "Voting is live. Share your dish, get support, and climb the leaderboard."
              : "Use a different email or mobile number to join this challenge."}
          </p>
        </div>
        <AcceptedEntries challenge={current} />
        {current.status === "waiting_opponents" && (
          <>
            {submitError && <ErrorBox message={submitError} />}
            <DishUploadForm
              mode={mode}
              title={
                mode === "team"
                  ? "Create Your Team Entry"
                  : "Join This Cook-Off"
              }
              buttonText="Accept Challenge"
              onSubmit={submit}
            />
            <ShareChallenge
              shareLink={shareLink}
              message="Join this OmiChef Cook-Off Dare and upload your dish!"
              title={`Invite More ${mode === "team" ? "Teams" : "Players"}`}
              description="Share this challenge link until all required entries join."
              buttonText="Share Challenge Link"
            />
          </>
        )}
        {current.status === "voting_open" && (
          <>
            <div className="center-card">
              <div className="badge">Share To Get Votes</div>
              <h1>Everyone Joined</h1>
              <p>
                Share the voting link with friends and family. The highest votes
                win.
              </p>
              <Link className="primary-btn" to={`/vote/${challengeId}`}>
                Open Voting Page
              </Link>
            </div>
            <ShareChallenge
              shareLink={currentVotingLink}
              message="Vote in this OmiChef Cook-Off Dare and help choose the winner!"
              title="Share Voting Link"
              description="One email or mobile number can vote once."
              buttonText="Share To Get Votes"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
export default AcceptChallengePage;
