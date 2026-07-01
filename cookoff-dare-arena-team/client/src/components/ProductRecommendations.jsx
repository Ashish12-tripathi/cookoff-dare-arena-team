function ProductRecommendations({ recommendations = [] }) {
  if (!recommendations.length) return null;
  const base = import.meta.env.VITE_SHOPIFY_COLLECTION_BASE || "";
  return (
    <div className="panel-card">
      <div className="section-badge">Cook Better Next Time</div>
      <h2>Recommended OmiChef Picks</h2>
      <div className="recommend-grid">
        {recommendations.map((r, i) => (
          <a
            className="recommend-card"
            key={i}
            href={`${base}${r.url}`}
            target="_blank"
            rel="noreferrer"
          >
            <strong>{r.title}</strong>
            <span>{r.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
export default ProductRecommendations;
