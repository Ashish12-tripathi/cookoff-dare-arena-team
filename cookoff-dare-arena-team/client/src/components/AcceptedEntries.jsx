function AcceptedEntries({ challenge }) {
  const isTeam = challenge.mode === "team";
  const entries = isTeam ? challenge.teams || [] : challenge.players || [];
  const total = isTeam ? challenge.maxTeams : challenge.maxPlayers;

  return (
    <div className="accepted-card">
      <div className="section-badge">
        {entries.length}/{total} {isTeam ? "Teams" : "Players"} Joined
      </div>

      <h2>{isTeam ? "Accepted Teams" : "Accepted Players"}</h2>

      <p className="muted">
        Voting opens automatically when everyone joins.
      </p>

      <div className="accepted-list">
        {entries.map((entry) => {
          const memberCount = isTeam ? entry.members?.length || 1 : 1;

          return (
            <div
              key={isTeam ? entry.teamId : entry.playerId}
              className="accepted-player"
            >
              <img src={entry.imageUrl} alt={entry.dishName} />

              <div className="accepted-entry-content">
                <div className="accepted-entry-top">
                  <strong>{isTeam ? entry.teamName : entry.name}</strong>

                  {isTeam && (
                    <span className="member-count-pill">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                  )}
                </div>

                <span className="accepted-dish-name">{entry.dishName}</span>

                <small>
                  {isTeam
                    ? `Captain: ${entry.captainName}`
                    : entry.contact}
                </small>

                {isTeam && entry.members?.length > 0 && (
                  <div className="member-mini-list">
                    {entry.members.map((member) => (
                      <span key={member.memberId}>
                        {member.roleLabel}: {member.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`waiting-box ${
          challenge.status === "voting_open" ? "success" : ""
        }`}
      >
        <strong>
          {challenge.status === "voting_open"
            ? "Voting is live"
            : "Waiting for more entries"}
        </strong>

        <span>
          {challenge.status === "voting_open"
            ? "Share the voting link and climb the leaderboard."
            : "Share the challenge link until all entries join."}
        </span>
      </div>
    </div>
  );
}

export default AcceptedEntries;