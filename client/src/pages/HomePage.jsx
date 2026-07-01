import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";

function HomePage() {
  const [params] = useSearchParams();
  const campaign = params.get("campaign") || "family-cookoff-2026";

  const recipe =
    import.meta.env.VITE_RECIPE_BLOG_URL ||
    `${import.meta.env.VITE_SHOPIFY_COLLECTION_BASE}/blogs/recipes`;

  const steps = [
  "Choose solo or team battle",
  "Pick your cook-off theme",
  "Upload your dish or team entry",
  "Invite players or teams to join",
  "Share voting link and climb the leaderboard",
];

  return (
    <Layout>
      <div className="page-stack">
        <section className="hero-card">
          <div className="badge">OmiChef Kitchen Battle</div>

          <h1>OmiChef Cook-Off Dare Arena</h1>

          <p>
            Create your dish, invite solo players or teams, collect votes, and
            unlock exclusive OmiChef rewards.
          </p>

          <Link
            className="primary-btn hero-btn"
            to={`/create?campaign=${campaign}`}
          >
            Start My Cook-Off
          </Link>
        </section>

        <section className="how-card">
  <h2>How it works</h2>

  <div className="home-steps-list">
    {steps.map((step, index) => (
      <div className="home-step-row" key={step}>
        <span className="home-step-number">{index + 1}</span>
        <span className="home-step-text">{step}</span>
      </div>
    ))}
  </div>

  <Link
    className="primary-btn home-start-btn"
    to={`/create?campaign=${campaign}`}
  >
    Start Cook-Off Dare
  </Link>
</section>
        <section className="recipe-box">
          <div className="recipe-copy">
            <h3>Need cooking inspiration?</h3>
            <p>Browse OmiChef recipes before choosing your challenge dish.</p>
          </div>

          <a
            className="recipe-btn"
            href={recipe}
            target="_blank"
            rel="noreferrer"
          >
            Browse Recipes
          </a>
        </section>
      </div>
    </Layout>
  );
}

export default HomePage;