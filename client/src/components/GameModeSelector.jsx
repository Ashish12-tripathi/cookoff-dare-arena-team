function GameModeSelector({ selectedMode, onSelectMode }) {
  const modes = [
    {
      id: "solo",
      title: "Individual Cook-Off",
      desc: "Upload your dish and invite a competitor to battle.",
    },
    {
      id: "team",
      title: "Team Cook-Off",
      desc: "Create your team and invite competitor teams.",
    },
  ];
  return (
    <div className="panel-card">
      <div className="section-badge">Battle Style</div>
      <h2>Choose your game mode</h2>
      <p>Play one-on-one or bring your family team into the kitchen battle.</p>
      <div className="mode-grid">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-card ${selectedMode === m.id ? "selected" : ""}`}
            onClick={() => onSelectMode(m.id)}
          >
            <strong>{m.title}</strong>
            <span>{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default GameModeSelector;
