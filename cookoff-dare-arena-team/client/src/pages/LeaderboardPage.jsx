import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { getLeaderboard } from "../api/voteApi";
function LeaderboardPage() {
  const { campaignId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getLeaderboard(campaignId);
        setLeaderboard(d.leaderboard || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);
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
  return (
    <Layout>
      <div className="page-stack">
        <div className="leaderboard-card">
          <div className="section-badge">Cook-Off Rankings</div>
          <h2>Season Leaderboard</h2>
          <p>Top dishes and teams from live and completed cook-offs.</p>
          <div className="leaderboard-table">
            <div className="leaderboard-head">
              <span>Rank</span>
              <span>Entry</span>
              <span>Votes</span>
            </div>
            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="leaderboard-empty">
                  <strong>No leaderboard data yet</strong>
                  <span>
                    Start a cook-off and collect votes to show rankings here.
                  </span>
                </div>
              ) : (
                leaderboard.map((item, index) => (
                  <div
                    className={`leaderboard-row ${index === 0 ? "winner" : ""}`}
                    key={`${item.challengeId}-${item.id}`}
                  >
                    <div className="leaderboard-rank">
                      {index === 0 ? "🏆" : `#${index + 1}`}
                    </div>
                    <div className="leaderboard-player">
                      <div className="leaderboard-info">
                        <strong>{item.name}</strong>
                        <span>{item.dishName}</span>
                      </div>
                      <div className="leader-meta">{item.dareThemeTitle}</div>
                    </div>
                    <div className="leader-votes">
                      <strong>{item.votes || 0}</strong>
                      <span>Votes</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="leaderboard-footer">
            Share voting links to climb the leaderboard.
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default LeaderboardPage;
