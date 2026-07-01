function BattleCard({ entry, mode, children }) {
  const name = mode === "team" ? entry.teamName : entry.name;
  const sub =
    mode === "team" ? `Captain: ${entry.captainName}` : `By ${entry.name}`;
  return (
    <div className="premium-dish-card">
      <div className="dish-img-wrap">
        <img src={entry.imageUrl} alt={entry.dishName} />
      </div>
      <div className="premium-dish-body">
        <div className="premium-role-pill">
          {mode === "team" ? "Team" : "Player"}
        </div>
        <h2>{entry.dishName}</h2>
        <p className="premium-byline">{sub}</p>
        <p className="premium-story">{entry.story}</p>
        <div className="premium-vote-count">{entry.votes || 0} votes</div>
        {children}
      </div>
    </div>
  );
}
export default BattleCard;
