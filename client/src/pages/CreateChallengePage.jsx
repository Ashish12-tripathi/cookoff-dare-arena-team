import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import GameModeSelector from "../components/GameModeSelector";
import DareThemeSelector from "../components/DareThemeSelector";
import DishUploadForm from "../components/DishUploadForm";
import ShareChallenge from "../components/ShareChallenge";
import AcceptedEntries from "../components/AcceptedEntries";
import { useCampaign } from "../hooks/useCampaign";
import { createChallenge } from "../api/challengeApi";
function CreateChallengePage() {
  const [params] = useSearchParams();
  const campaignId = params.get("campaign") || "family-cookoff-2026";
  const { campaign, loading, error } = useCampaign(campaignId);
  const [mode, setMode] = useState("solo"),
    [selectedTheme, setSelectedTheme] = useState(null),
    [maxPlayers, setMaxPlayers] = useState(2),
    [maxTeams, setMaxTeams] = useState(2),
    [shareData, setShareData] = useState(null),
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
  const theme = selectedTheme || campaign.dareThemes[0];
  const submit = async (entry) => {
    if (!theme) return setSubmitError("Please select a theme first.");
    try {
      const data = await createChallenge({
        campaignId: campaign.campaignId,
        dareThemeId: theme.id,
        creator: entry,
        mode,
        maxPlayers: Number(maxPlayers),
        maxTeams: Number(maxTeams),
      });
      setShareData(data);
      setSubmitError("");
    } catch (err) {
      const m = err.response?.data?.message || "Failed to create challenge";
      alert(m);
      setSubmitError(m);
    }
  };
  return (
    <Layout>
      <div className="page-stack">
        {shareData ? (
          <>
            <div className="center-card">
              <div className="badge">Challenge Created</div>
              <h1>
                Waiting For {mode === "team" ? "Teams" : "Players"} To Join
              </h1>
              <p>
                Share this challenge link. Voting opens automatically once
                everyone joins.
              </p>
            </div>
            <AcceptedEntries challenge={shareData.challenge} />
            <ShareChallenge
              shareLink={shareData.shareLink}
              message={campaign.whatsappMessage}
              title={`Invite ${mode === "team" ? "Teams" : "Players"}`}
              description={`Send this link to ${mode === "team" ? "other team captains" : "other players"}.`}
              buttonText="Share Challenge Link"
            />
          </>
        ) : (
          <>
            <div className="center-card">
              <div className="badge">Create Challenge</div>
              <h1>Create Cook-Off</h1>
              <p>
                Create your challenge, invite players or teams, and compete for
                the top spot on the leaderboard.
              </p>
            </div>
            <GameModeSelector selectedMode={mode} onSelectMode={setMode} />
            <DareThemeSelector
              themes={campaign.dareThemes}
              selectedTheme={theme}
              onSelectTheme={setSelectedTheme}
            />
            <div className="form-card">
              <label>
                {mode === "team"
                  ? "Total teams including yours"
                  : "Total players including you"}
              </label>
              <select
                value={mode === "team" ? maxTeams : maxPlayers}
                onChange={(e) =>
                  mode === "team"
                    ? setMaxTeams(e.target.value)
                    : setMaxPlayers(e.target.value)
                }
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {mode === "team" ? "teams" : "players"}
                  </option>
                ))}
              </select>
            </div>
            {submitError && <ErrorBox message={submitError} />}
            <DishUploadForm
              mode={mode}
              title={
                mode === "team" ? "Create Your Team Dish" : "Upload Your Dish"
              }
              buttonText={
                mode === "team" ? "Create Team Cook-Off" : "Create Cook-Off"
              }
              onSubmit={submit}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
export default CreateChallengePage;
