const mongoose = require("mongoose");

const winnerVoterSchema = new mongoose.Schema(
  {
    voterName: {
      type: String,
      default: "",
      trim: true,
    },

    voterContact: {
      type: String,
      default: "",
      trim: true,
    },

    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    publicChallengeId: {
      type: String,
      default: "",
      index: true,
    },

    campaignId: {
      type: String,
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["individual", "solo", "team"],
      required: true,
    },

    winnerType: {
      type: String,
      enum: ["player", "team"],
      required: true,
    },

    winnerId: {
      type: String,
      required: true,
    },

    winnerName: {
      type: String,
      required: true,
      trim: true,
    },

    dishName: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    totalVotes: {
      type: Number,
      default: 0,
    },

    captainName: {
      type: String,
      default: "",
      trim: true,
    },

    captainContact: {
      type: String,
      default: "",
      trim: true,
    },

    playerName: {
      type: String,
      default: "",
      trim: true,
    },

    playerContact: {
      type: String,
      default: "",
      trim: true,
    },

    winnerVoters: {
      type: [winnerVoterSchema],
      default: [],
    },

    winnerVoterCount: {
      type: Number,
      default: 0,
    },

    rewardStatus: {
      type: String,
      enum: ["pending", "claimed", "expired"],
      default: "pending",
    },

    rewardCode: {
      type: String,
      default: "",
      trim: true,
    },

    contactInstruction: {
      type: String,
      default:
        "Congratulations! Please contact OmiChef support to collect your winner reward.",
    },

    declaredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

winnerSchema.index(
  { challengeId: 1, winnerId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Winner", winnerSchema);