const mongoose = require("mongoose");
const dareThemeSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    description: String,
    productCollectionUrl: String,
  },
  { _id: false },
);
const campaignSchema = new mongoose.Schema(
  {
    campaignId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    dareThemes: { type: [dareThemeSchema], default: [] },
    coupons: {
      winner: { type: String, default: "COOKWIN500" },
      runner: { type: String, default: "RUNNER15" },
      voter: { type: String, default: "VOTER10" },
    },
    votingDurationHours: { type: Number, default: 12 },
    whatsappMessage: {
      type: String,
      default: "Join my OmiChef Cook-Off Dare and help choose the winner!",
    },
    recipeUrl: { type: String, default: "/blogs/recipes" },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Campaign", campaignSchema);
