import { useState } from "react";
import BattleCard from "./BattleCard";
import VoteButton from "./VoteButton";
const validEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const validPhone = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  return d.length >= 8 && d.length <= 15;
};
const validContact = (v) => validEmail(v) || validPhone(v);
function VotingArena({ challenge, onVote, voting }) {
  const [voterName, setVoterName] = useState(""),
    [voterContact, setVoterContact] = useState("");
  const mode = challenge.mode || "solo";
  const entries =
    mode === "team" ? challenge.teams || [] : challenge.players || [];
  const vote = (id) => {
    if (!voterName.trim())
      return alert("Please enter your name before voting.");
    if (!validContact(voterContact))
      return alert("Please enter a valid email or mobile number.");
    onVote({
      votedForId: id,
      voterName: voterName.trim(),
      voterContact: voterContact.trim().toLowerCase().replace(/\s+/g, ""),
    });
  };
  return (
    <div className="arena-card">
      <div className="arena-heading">
        <div className="badge">Vote Now</div>
        <h1>{challenge.dareThemeTitle}</h1>
        <p>
          Voting is live. Share your dish, get support, and climb the
          leaderboard.
        </p>
      </div>
      <div className="form-card compact">
        <label>Your name</label>
        <input
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          placeholder="Enter your name"
        />
        <label>Email or mobile number</label>
        <input
          value={voterContact}
          onChange={(e) => setVoterContact(e.target.value)}
          placeholder="example@gmail.com or 9876543210"
        />
        <small>One email or mobile number can vote only once.</small>
      </div>
      <div className="battle-grid premium-battle-grid">
        {entries.map((e) => {
          const id = mode === "team" ? e.teamId : e.playerId;
          return (
            <BattleCard key={id} entry={e} mode={mode}>
              <VoteButton
                disabled={voting || challenge.status === "closed"}
                onClick={() => vote(id)}
              >
                Vote For {mode === "team" ? e.teamName : e.name}
              </VoteButton>
            </BattleCard>
          );
        })}
      </div>
    </div>
  );
}
export default VotingArena;
