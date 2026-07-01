const Challenge = require("../models/Challenge");
const getLeaderboardByCampaign = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      campaignId: req.params.campaignId,
      status: { $in: ["voting_open", "closed"] },
    })
      .sort({ updatedAt: -1 })
      .limit(30);
    const leaderboard = [];
    challenges.forEach((ch) => {
      const entries = ch.mode === "team" ? ch.teams : ch.players;
      entries.forEach((entry) =>
        leaderboard.push({
          challengeId: ch.challengeId,
          mode: ch.mode,
          dareThemeTitle: ch.dareThemeTitle,
          id: ch.mode === "team" ? entry.teamId : entry.playerId,
          name: ch.mode === "team" ? entry.teamName : entry.name,
          dishName: entry.dishName,
          imageUrl: entry.imageUrl,
          votes: entry.votes || 0,
          status: ch.status,
        }),
      );
    });
    leaderboard.sort((a, b) => b.votes - a.votes);
    return res.json({ success: true, leaderboard });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load leaderboard",
        error: error.message,
      });
  }
};
module.exports = { getLeaderboardByCampaign };
