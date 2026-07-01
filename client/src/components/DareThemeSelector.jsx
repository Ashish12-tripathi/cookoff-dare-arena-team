function DareThemeSelector({ themes, selectedTheme, onSelectTheme }) {
  const recipeBlogUrl =
    import.meta.env.VITE_RECIPE_BLOG_URL ||
    `${import.meta.env.VITE_SHOPIFY_COLLECTION_BASE}/blogs/recipes`;
  return (
    <div className="panel-card">
      <div className="section-badge">Cook-Off Theme</div>
      <h2>Choose your battle theme</h2>
      <p>
        Pick your dish idea, or explore OmiChef recipes first if you need
        inspiration.
      </p>
      <div className="theme-grid">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-option ${selectedTheme?.id === t.id ? "selected" : ""}`}
            onClick={() => onSelectTheme(t)}
          >
            <strong>{t.title}</strong>
            <span>{t.description}</span>
          </button>
        ))}
      </div>
      <div className="recipe-box">
        <div>
          <h3>Need cooking inspiration?</h3>
          <p>
            Browse recipes, choose your dish, then come back and start your
            cook-off.
          </p>
        </div>
        <a
          className="recipe-btn"
          href={recipeBlogUrl}
          target="_blank"
          rel="noreferrer"
        >
          View Recipe Ideas
        </a>
      </div>
    </div>
  );
}
export default DareThemeSelector;
