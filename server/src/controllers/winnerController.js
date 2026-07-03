const Winner = require("../models/Winner");

exports.getWinnerByChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const winner = await Winner.findOne({ challengeId }).lean();

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found yet.",
      });
    }

    return res.json({
      success: true,
      winner,
    });
  } catch (error) {
    console.error("Get winner error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch winner record.",
    });
  }
};

exports.getAllWinners = async (req, res) => {
  try {
    const winners = await Winner.find({})
      .sort({ declaredAt: -1 })
      .lean();

    return res.json({
      success: true,
      winners,
    });
  } catch (error) {
    console.error("Get all winners error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch winners.",
    });
  }
};