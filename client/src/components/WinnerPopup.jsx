function WinnerPopup({ challenge, winnerRecord, onClose }) {
  if (!challenge || !winnerRecord || challenge.status !== "closed") {
    return null;
  }

  const whatsappNumber =
    import.meta.env.VITE_WINNER_WHATSAPP_NUMBER || "910000000000";

  const winnerName = winnerRecord.winnerName || "Winner";
  const dishName = winnerRecord.dishName || "Winning dish";
  const totalVotes = winnerRecord.totalVotes || 0;

  const message = encodeURIComponent(
    `Hi OmiChef, I am the winner of the Cook-Off Dare Arena.\n\nWinner Name: ${winnerName}\nDish: ${dishName}\nVotes: ${totalVotes}\nChallenge ID: ${challenge.challengeId}\n\nPlease help me claim my special reward.`
  );

  return (
    <div className="winner-popup-overlay">
      <div className="winner-popup-card">
        <button
          type="button"
          className="winner-popup-close"
          onClick={onClose}
          aria-label="Close winner popup"
        >
          ×
        </button>

        <div className="winner-popup-icon">🏆</div>

        <div className="winner-popup-badge">Winner Declared</div>

        <h2>Congratulations!</h2>

        <p className="winner-popup-main">
          <strong>{winnerName}</strong> has won the OmiChef Cook-Off Dare Arena.
        </p>

        <div className="winner-popup-details">
          <div>
            <span>Winning Dish</span>
            <strong>{dishName}</strong>
          </div>

          <div>
            <span>Total Votes</span>
            <strong>{totalVotes}</strong>
          </div>
        </div>

        <p className="winner-popup-text">
          To collect your special winner reward, contact OmiChef on WhatsApp and
          share your challenge details.
        </p>

        <a
          className="winner-popup-btn"
          href={`https://wa.me/${whatsappNumber}?text=${message}`}
          target="_blank"
          rel="noreferrer"
        >
          Claim Winner Reward
        </a>

        <p className="winner-popup-note">
          Keep your challenge link ready for quick verification.
        </p>
      </div>
    </div>
  );
}

export default WinnerPopup;