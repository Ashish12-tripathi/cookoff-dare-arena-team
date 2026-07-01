const Challenge = require("../models/Challenge");
const { closeChallengeIfExpired } = require("./challengeController");
const getResult = async (req, res) => {
  try {
    let challenge = await Challenge.findOne({
      challengeId: req.params.challengeId,
    });
    if (!challenge)
      return res
        .status(404)
        .json({ success: false, message: "Challenge not found" });
    challenge = await closeChallengeIfExpired(challenge);
    return res.json({ success: true, challenge });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load result",
        error: error.message,
      });
  }
};
module.exports = { getResult };
