function VoteButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      className="vote-btn"
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? "Submitting..." : children}
    </button>
  );
}
export default VoteButton;
