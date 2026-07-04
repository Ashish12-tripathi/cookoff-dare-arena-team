import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";

function HomePage() {
  const [params] = useSearchParams();
  const campaign = params.get("campaign") || "family-cookoff-2026";

  const recipe =
    import.meta.env.VITE_RECIPE_BLOG_URL ||
    `${import.meta.env.VITE_SHOPIFY_COLLECTION_BASE}/blogs/recipes`;

  const steps = [
    {
      title: "Create your cook-off challenge",
      points: [
        "Choose individual or team battle.",
        "Pick your cooking theme.",
        "Add your dish details and food photo.",
      ],
    },
    {
      title: "Share invite link with competitors",
      points: [
        "Send your challenge link on WhatsApp.",
        "Invite friends, family or other teams.",
        "Let them join the same cook-off battle.",
      ],
    },
    {
      title: "Open voting for everyone",
      points: [
        "After entries are ready, voting starts.",
        "Each dish appears in the voting arena.",
        "People can vote for their favourite entry.",
      ],
    },
    {
      title: "Share voting link to gain votes",
      points: [
        "Share your voting link again and again.",
        "Ask your circle to support your dish.",
        "More votes help you climb the leaderboard.",
      ],
    },
    {
      title: "Win exciting OmiChef rewards",
      points: [
        "Highest votes will win the challenge.",
        "Winners will unlock special rewards.",
        "Voters will also receive coupon offers.",
      ],
    },
  ];

  return (
    <Layout>
      <div className="page-stack">
        <section className="hero-card">
          <div className="badge">OmiChef Kitchen Battle</div>

          <h1>OmiChef Cook-Off Dare Arena</h1>

          <p>
            Create your dish challenge, invite competitors, collect votes, and
            unlock exclusive OmiChef rewards.
          </p>

          <Link
            className="primary-btn hero-btn"
            to={`/create?campaign=${campaign}`}
          >
            Start My Cook-Off
          </Link>
        </section>

        <section className="how-card cookoff-how-card">
          <div className="how-heading-wrap">
            <div className="how-mini-badge">Easy Cooking Battle</div>

            <h2>How it works</h2>

            <p>
              Create a cook-off challenge, share it with people you want to
              compete with, then collect votes by sharing your voting link.
            </p>
          </div>

          <div className="home-steps-list cookoff-dropdown-list">
            {steps.map((step, index) => (
              <details
                className="home-step-row cookoff-step-dropdown"
                key={step.title}
              >
                <summary>
                  <span className="home-step-number">{index + 1}</span>
                  <span className="home-step-text">{step.title}</span>
                  <span className="step-dropdown-icon">+</span>
                </summary>

                <div className="step-dropdown-content">
                  <ul>
                    {step.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>

          <Link
            className="primary-btn home-start-btn"
            to={`/create?campaign=${campaign}`}
          >
            Start Cook-Off Dare
          </Link>
        </section>

        <section className="cookoff-reward-info-banner">
          <div className="reward-info-header">
            <div className="reward-info-icon">🎁</div>

            <div className="reward-info-title">
              <span>Reward Info</span>
              <h2>Coupons unlock after result</h2>
            </div>
          </div>

          <div className="reward-info-points">
            <div className="reward-info-point">
              <div className="reward-check">✓</div>
              <div>
                <strong>Result after 12 hours</strong>
                <p>
                  Result is declared 12 hours after all entries are uploaded.
                </p>
              </div>
            </div>

            <div className="reward-info-point">
              <div className="reward-check">✓</div>
              <div>
                <strong>Coupons after result</strong>
                <p>
                  Winner, runner-up and voter codes appear after declaration.
                </p>
              </div>
            </div>

            <div className="reward-info-point premium">
              <div className="reward-check">★</div>
              <div>
                <strong>25+ votes special reward</strong>
                <p>
                  Winner with 25+ votes can contact OmiChef for a premium
                  reward.
                </p>
              </div>
            </div>
          </div>
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