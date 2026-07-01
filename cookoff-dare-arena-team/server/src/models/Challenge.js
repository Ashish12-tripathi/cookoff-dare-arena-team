const mongoose = require("mongoose");
const playerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    role: { type: String, enum: ["creator", "opponent"], required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true, lowercase: true },
    dishName: { type: String, required: true, trim: true },
    story: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    votes: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true, lowercase: true },
    roleLabel: { type: String, default: "Member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const teamSchema = new mongoose.Schema(
  {
    teamId: { type: String, required: true },
    role: { type: String, enum: ["creator", "opponent"], required: true },
    teamName: { type: String, required: true, trim: true },
    captainName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true, lowercase: true },
    dishName: { type: String, required: true, trim: true },
    story: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    members: { type: [memberSchema], default: [] },
    votes: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const challengeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, unique: true, trim: true },
    mode: { type: String, enum: ["solo", "team"], default: "solo" },
    campaignId: { type: String, required: true, trim: true },
    dareThemeId: { type: String, required: true, trim: true },
    dareThemeTitle: { type: String, required: true },
    productCollectionUrl: { type: String, default: "" },
    maxPlayers: { type: Number, default: 2, min: 2, max: 6 },
    maxTeams: { type: Number, default: 2, min: 2, max: 6 },
    players: { type: [playerSchema], default: [] },
    teams: { type: [teamSchema], default: [] },
    status: {
      type: String,
      enum: ["waiting_opponents", "voting_open", "closed"],
      default: "waiting_opponents",
    },
    votingEndsAt: { type: Date, default: null },
    winnerPlayerId: { type: String, default: "" },
    winnerTeamId: { type: String, default: "" },
  },
  { timestamps: true },
);

challengeSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);
module.exports = mongoose.model("Challenge", challengeSchema);
