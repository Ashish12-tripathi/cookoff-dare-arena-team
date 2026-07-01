function ShopNowCTA({ url }) {
  const base = import.meta.env.VITE_SHOPIFY_COLLECTION_BASE || "";
  return (
    <div className="shop-cta-card">
      <div className="section-badge">OmiChef Store</div>
      <h2>Want To Win The Next Cook-Off?</h2>
      <p>
        Explore cookware made for everyday Indian kitchens, snacks, breakfast
        plates, and family meals.
      </p>
      <a
        className="primary-btn"
        href={`${base}${url || "/collections/all"}`}
        target="_blank"
        rel="noreferrer"
      >
        Shop Cookware
      </a>
    </div>
  );
}
export default ShopNowCTA;
