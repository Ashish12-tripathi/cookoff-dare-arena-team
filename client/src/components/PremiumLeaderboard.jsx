function PremiumLeaderboard({ challenge }) {
  const mode = challenge.mode || "solo";

  const entries = [
    ...(mode === "team" ? challenge.teams || [] : challenge.players || []),
  ].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const totalVotes = entries.reduce((sum, e) => sum + (e.votes || 0), 0);

  const winner = entries.find((e) =>
    mode === "team"
      ? e.teamId === challenge.winnerTeamId
      : e.playerId === challenge.winnerPlayerId
  );

  const nameOf = (e) => (mode === "team" ? e.teamName : e.name);
  const idOf = (e) => (mode === "team" ? e.teamId : e.playerId);

  const winnerName = winner ? nameOf(winner) : "Winner";
  const winnerDish = winner?.dishName || "Winning dish";
  const winnerVotes = winner?.votes || 0;

  const heading =
    challenge.status === "closed"
      ? `${winnerName} Wins The Cook-Off`
      : totalVotes === 0
        ? "Leaderboard Is Waiting For Votes"
        : "Who Is Winning Right Now?";

  const desc =
    challenge.status === "closed"
      ? "Voting is closed. The highest voted entry is the winner."
      : totalVotes === 0
        ? "No votes yet. Share the voting link and start the battle."
        : "Leaderboard updates as votes come in. Share the voting link to climb higher.";

  const claimMessage = encodeURIComponent(
    `Hi OmiChef, I am the winner of the Cook-Off Dare Arena.\n\nWinner Name: ${winnerName}\nDish: ${winnerDish}\nVotes: ${winnerVotes}\nChallenge ID: ${
      challenge.challengeId || ""
    }\n\nPlease help me claim my special reward coupon.`
  );

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
        <>
          <div className="leaderboard-footer winner-footer">
            🏆 {winnerName} won with {winnerVotes} votes.
          </div>

          <section className="compact-prize-card">
            <div className="compact-prize-head">
              <div className="compact-prize-icon">🏆</div>

              <div>
                <span>OmiChef Winner Reward</span>
                <h3>Congratulations, {winnerName}!</h3>
                <p>
                  You won the cook-off challenge. Tap the button below to send
                  OmiChef your winner details and receive your special reward
                  code.
                </p>
              </div>
            </div>

            <div className="winner-highlight-box">
              <div className="winner-highlight-main">
                <span>Winner</span>
                <strong>{winnerName}</strong>
              </div>

              <div className="winner-highlight-votes">
                <span>Votes</span>
                <strong>{winnerVotes}</strong>
              </div>
            </div>

            <div className="premium-vote-rule">
              <span>⭐</span>
              <p>
                Winner with <strong>100+ votes</strong> can claim a premium
                OmiChef special reward after verification.
              </p>
            </div>

            <div className="compact-coupon-grid">
              <div className="compact-coupon winner-secret">
                <span>Winner Special</span>
                <strong>Click button to claim</strong>
              </div>

              <div className="compact-coupon">
                <span>Runner-up</span>
                <strong>RUNNERUP5</strong>
              </div>

              <div className="compact-coupon">
                <span>Voter</span>
                <strong>VOTER10</strong>
              </div>

              <div className="compact-coupon muted">
                <span>Winning Dish</span>
                <strong>{winnerDish}</strong>
              </div>
            </div>

            <a
              className="compact-prize-btn"
              href={`https://wa.me/${
                import.meta.env.VITE_WINNER_WHATSAPP_NUMBER || "919311380804"
              }?text=${claimMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              Send Message To Get Special Code
            </a>
          </section>
        </>
      )}
    </div>
  );
}

export default PremiumLeaderboard;