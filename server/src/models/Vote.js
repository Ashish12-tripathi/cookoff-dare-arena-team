const mongoose = require("mongoose");
const voteSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, trim: true },
    mode: { type: String, enum: ["solo", "team"], default: "solo" },
    votedForId: { type: String, required: true, trim: true },
    votedForType: { type: String, enum: ["player", "team"], required: true },
    voterName: { type: String, required: true, trim: true },
    voterContact: { type: String, required: true, trim: true, lowercase: true },
    browserId: { type: String, default: "" },
    voterIp: { type: String, default: "" },
  },
  { timestamps: true },
);
voteSchema.index({ challengeId: 1, voterContact: 1 }, { unique: true });

voteSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);
module.exports = mongoose.model("Vote", voteSchema);
