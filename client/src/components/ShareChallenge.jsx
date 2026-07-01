import { createWhatsappLink } from "../utils/whatsappShare";
function ShareChallenge({
  shareLink,
  message,
  title = "Share Challenge",
  description = "Copy or share this link with others.",
  buttonText = "Share on WhatsApp",
}) {
  const copy = async () => {
    if (!shareLink) return alert("Link is not ready yet.");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied!");
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = shareLink;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Link copied!");
    } catch {
      window.prompt("Copy this link manually:", shareLink);
    }
  };
  return (
    <div className="share-card">
      <div className="section-badge">Share Moment</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="visible-link-box">
        {shareLink || "Generating link..."}
      </div>
      <button className="secondary-btn" onClick={copy}>
        Copy Link
      </button>
      {shareLink && (
        <a
          className="primary-btn"
          target="_blank"
          rel="noreferrer"
          href={createWhatsappLink(
            message || "Join this OmiChef Cook-Off Dare!",
            shareLink,
          )}
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}
export default ShareChallenge;
