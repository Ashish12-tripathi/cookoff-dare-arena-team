import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import PremiumLeaderboard from "../components/PremiumLeaderboard";
import { useChallenge } from "../hooks/useChallenge";
function ResultsPage() {
  const { challengeId } = useParams();
  const { challenge, loading, error } = useChallenge(challengeId);
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
        <PremiumLeaderboard challenge={challenge} />
      </div>
    </Layout>
  );
}
export default ResultsPage;
