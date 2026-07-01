function CouponReveal({ title, code }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Coupon copied!");
    } catch {
      window.prompt("Copy this coupon:", code);
    }
  };
  return (
    <div className="coupon-card">
      <div className="section-badge">Coupon</div>
      <h2>{title}</h2>
      <button className="coupon-code" onClick={copy}>
        {code}
      </button>
    </div>
  );
}
export default CouponReveal;
