import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import CreateChallengePage from "./pages/CreateChallengePage";
import AcceptChallengePage from "./pages/AcceptChallengePage";
import VotingPage from "./pages/VotingPage";
import ResultsPage from "./pages/ResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./pages/NotFound";
function QueryRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const challengeId = params.get("challenge");
    const campaignId = params.get("campaign") || "family-cookoff-2026";
    const view = params.get("view");
    if (challengeId && view === "vote") {
      navigate(`/vote/${challengeId}?campaign=${campaignId}`, {
        replace: true,
      });
      return;
    }
    if (challengeId) {
      navigate(`/challenge/${challengeId}?campaign=${campaignId}`, {
        replace: true,
      });
    }
  }, [params, navigate]);
  return <HomePage />;
}
function App() {
  return (
    <Routes>
      <Route path="/" element={<QueryRedirect />} />
      <Route path="/create" element={<CreateChallengePage />} />
      <Route path="/challenge/:challengeId" element={<AcceptChallengePage />} />
      <Route path="/vote/:challengeId" element={<VotingPage />} />
      <Route path="/results/:challengeId" element={<ResultsPage />} />
      <Route path="/leaderboard/:campaignId" element={<LeaderboardPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
