function PremiumLeaderboard({ challenge }) {
  const mode = challenge.mode || "solo";
  const entries = [
    ...(mode === "team" ? challenge.teams || [] : challenge.players || []),
  ].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const totalVotes = entries.reduce((sum, e) => sum + (e.votes || 0), 0);
  const winner = entries.find((e) =>
    mode === "team"
      ? e.teamId === challenge.winnerTeamId
      : e.playerId === challenge.winnerPlayerId,
  );
  const nameOf = (e) => (mode === "team" ? e.teamName : e.name);
  const idOf = (e) => (mode === "team" ? e.teamId : e.playerId);
  const heading =
    challenge.status === "closed"
      ? `${winner ? nameOf(winner) : "Winner"} Wins The Cook-Off`
      : totalVotes === 0
        ? "Leaderboard Is Waiting For Votes"
        : "Who Is Winning Right Now?";
  const desc =
    challenge.status === "closed"
      ? "Voting is closed. The highest voted entry is the winner."
      : totalVotes === 0
        ? "No votes yet. Share the voting link and start the battle."
        : "Leaderboard updates as votes come in. Share the voting link to climb higher.";
  return (
    <div className="leaderboard-card">
      <div className="section-badge">
        {challenge.status === "closed" ? "Winner Declared" : "Live Leaderboard"}
      </div>
      <h2>{heading}</h2>
      <p>{desc}</p>
      <div className="leaderboard-table">
        <div className="leaderboard-head">
          <span>Rank</span>
          <span>{mode === "team" ? "Team" : "Player"}</span>
          <span>Votes</span>
        </div>
        <div className="leaderboard-list">
          {entries.map((e, index) => {
            const votes = e.votes || 0;
            const percent =
              totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isWinner =
              (challenge.status === "closed" &&
                idOf(e) ===
                  (mode === "team"
                    ? challenge.winnerTeamId
                    : challenge.winnerPlayerId)) ||
              (challenge.status !== "closed" && index === 0 && totalVotes > 0);
            return (
              <div
                key={idOf(e)}
                className={`leaderboard-row ${isWinner ? "winner" : ""}`}
              >
                <div className="leaderboard-rank">
                  {index === 0 ? "🏆" : `#${index + 1}`}
                </div>
                <div className="leaderboard-player">
                  <div className="leaderboard-info">
                    <strong>{nameOf(e) || "Entry"}</strong>
                    <span>{e.dishName || "Untitled Dish"}</span>
                  </div>
                  <div className="leader-progress">
                    <div
                      className="leader-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <div className="leader-votes">
                  <strong>{votes}</strong>
                  <span>Votes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {challenge.status === "voting_open" && challenge.votingEndsAt && (
        <div className="leaderboard-footer">
          Winner auto-declares after 12 hours.
        </div>
      )}
      {challenge.status === "closed" && winner && (
        <div className="leaderboard-footer winner-footer">
          🏆 {nameOf(winner)} won with {winner.votes || 0} votes.
        </div>
      )}
    </div>
  );
}
export default PremiumLeaderboard;
